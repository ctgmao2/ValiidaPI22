import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertTaskSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid credentials format", 
          details: validation.error.format() 
        });
      }
      
      const { username, password } = validation.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Allow partial updates by picking only the fields that are provided
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  
  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // First get the user to log its name
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error: any) {
      // Handle foreign key constraint errors
      if (error.code === '23503') { // PostgreSQL foreign key violation code
        if (error.message.includes('tasks_assignee_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete user because they are assigned to tasks. Reassign or delete these tasks first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "tasks_assignee_id_fkey"
          });
        } else if (error.message.includes('tasks_reporter_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete user because they are the reporter of tasks. Change reporter or delete these tasks first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "tasks_reporter_id_fkey"
          });
        } else if (error.message.includes('activities_user_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete user because they have associated activities. Delete these activities first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "activities_user_id_fkey"
          });
        } else if (error.message.includes('comments_user_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete user because they have created comments. Delete these comments first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "comments_user_id_fkey"
          });
        }
      }
      
      // Generic error response
      console.error("Error deleting user:", error);
      res.status(500).json({ 
        message: "Failed to delete user due to a database constraint.",
        error: error.message
      });
    }
  });
  
  // Project routes
  app.get("/api/projects", async (req: Request, res: Response) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });
  
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      // Process any date fields that might be in the project data
      const preprocessedData = {
        ...req.body,
        // Add any date fields that might need conversion here
      };
      
      const projectData = insertProjectSchema.parse(preprocessedData);
      const project = await storage.createProject(projectData);
      
      // Create an activity for project creation
      if (req.body.userId) {
        await storage.createActivity({
          type: "project-created",
          description: `created a new project: ${project.name}`,
          userId: req.body.userId,
          projectId: project.id
        });
      }
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Project creation error:", error);
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    try {
      // Process any date fields that might be in the project data
      const preprocessedData = {
        ...req.body,
        // Add any date fields that might need conversion here
      };
      
      // Allow partial updates by picking only the fields that are provided
      const projectData = insertProjectSchema.partial().parse(preprocessedData);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create an activity for project update
      if (req.body.userId) {
        await storage.createActivity({
          type: "project-updated",
          description: `updated project: ${project.name}`,
          userId: req.body.userId,
          projectId: project.id
        });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    // First get the project to log its name
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    try {
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create an activity for project deletion
      if (req.body.userId) {
        await storage.createActivity({
          type: "project-updated",
          description: `deleted project: ${project.name}`,
          userId: req.body.userId
        });
      }
      
      res.status(204).end();
    } catch (error: any) {
      // Handle foreign key constraint errors
      if (error.code === '23503') { // PostgreSQL foreign key violation code
        if (error.message.includes('tasks_project_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete project because it has associated tasks. Please delete tasks first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "tasks_project_id_fkey"
          });
        } else if (error.message.includes('activities_project_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete project because it has associated activities. Please delete activities first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "activities_project_id_fkey"
          });
        }
      }
      
      // Generic error response
      console.error("Error deleting project:", error);
      res.status(500).json({ 
        message: "Failed to delete project due to a database constraint.",
        error: error.message
      });
    }
  });
  
  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    const projectId = req.query.projectId;
    
    let tasks;
    if (projectId) {
      const id = parseInt(projectId as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      tasks = await storage.getTasksByProject(id);
    } else {
      tasks = await storage.getAllTasks();
    }
    
    res.json(tasks);
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      // Pre-process date fields to handle ISO strings
      const preprocessedData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null
      };
      
      const taskData = insertTaskSchema.parse(preprocessedData);
      const task = await storage.createTask(taskData);
      
      // Create an activity for task creation if assignee is provided
      if (taskData.assigneeId && taskData.projectId) {
        await storage.createActivity({
          type: "task-created",
          description: `created a new task: ${task.title}`,
          userId: taskData.assigneeId,
          taskId: task.id,
          projectId: taskData.projectId
        });
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Task creation error:", error);
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    try {
      // Pre-process date fields to handle ISO strings
      const preprocessedData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined
      };
      
      // Allow partial updates by picking only the fields that are provided
      const taskData = insertTaskSchema.partial().parse(preprocessedData);
      const task = await storage.updateTask(id, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Create an activity for task update if userId is provided
      if (req.body.userId && task.projectId) {
        const activityType = taskData.status === "completed" ? "task-completed" : "task-updated";
        await storage.createActivity({
          type: activityType,
          description: taskData.status === "completed" 
            ? `completed task: ${task.title}` 
            : `updated task: ${task.title}`,
          userId: req.body.userId,
          taskId: task.id,
          projectId: task.projectId
        });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    // First get the task to log its title
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    try {
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Create an activity for task deletion
      if (req.body.userId && task.projectId) {
        await storage.createActivity({
          type: "task-updated",
          description: `deleted task: ${task.title}`,
          userId: req.body.userId,
          projectId: task.projectId
        });
      }
      
      res.status(204).end();
    } catch (error: any) {
      // Handle foreign key constraint errors
      if (error.code === '23503') { // PostgreSQL foreign key violation code
        if (error.message.includes('activities_task_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete task because it has associated activities. You may need to delete the activities first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "activities_task_id_fkey"
          });
        } else if (error.message.includes('task_dependencies_task_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete task because it has dependencies. Please remove dependencies first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "task_dependencies_task_id_fkey"
          });
        } else if (error.message.includes('task_dependencies_depends_on_id_fkey')) {
          return res.status(409).json({ 
            message: "Cannot delete task because other tasks depend on it. Please remove dependencies first.",
            error: "FOREIGN_KEY_VIOLATION",
            details: "task_dependencies_depends_on_id_fkey"
          });
        }
      }
      
      // Generic error response
      console.error("Error deleting task:", error);
      res.status(500).json({ 
        message: "Failed to delete task due to a database constraint.",
        error: error.message
      });
    }
  });
  
  app.patch("/api/tasks/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    const { status, userId } = req.body;
    if (!status || !userId) {
      return res.status(400).json({ message: "Status and userId are required" });
    }
    
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const updatedTask = await storage.updateTaskStatus(id, status);
    
    // Create an activity for task status update
    const activityType = status === "completed" ? "task-completed" : "task-updated";
    await storage.createActivity({
      type: activityType,
      description: status === "completed" ? 
        `completed ${task.title}` : 
        `updated status of ${task.title} to ${status}`,
      userId: parseInt(userId),
      taskId: id,
      projectId: task.projectId!
    });
    
    res.json(updatedTask);
  });
  
  // Activity routes
  app.get("/api/activities/recent", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const activities = await storage.getRecentActivities(limit);
    
    // For each activity, fetch the associated user
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId!);
        const task = await storage.getTask(activity.taskId!);
        return {
          ...activity,
          user,
          task
        };
      })
    );
    
    res.json(activitiesWithUsers);
  });
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    const taskCounts = await storage.countTasksByStatus();
    res.json(taskCounts);
  });
  
  app.get("/api/dashboard/due-soon", async (req: Request, res: Response) => {
    const tasks = await storage.getTasksDueSoon();
    
    // For each task, fetch the associated assignee
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assignee = task.assigneeId ? await storage.getUser(task.assigneeId) : null;
        return {
          ...task,
          assignee
        };
      })
    );
    
    res.json(tasksWithAssignees);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
