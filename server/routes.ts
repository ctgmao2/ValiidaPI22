import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertTaskSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
    
    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(204).end();
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
      const projectData = insertProjectSchema.parse(req.body);
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
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    try {
      // Allow partial updates by picking only the fields that are provided
      const projectData = insertProjectSchema.partial().parse(req.body);
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
      const taskData = insertTaskSchema.parse(req.body);
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
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    try {
      // Allow partial updates by picking only the fields that are provided
      const taskData = insertTaskSchema.partial().parse(req.body);
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
