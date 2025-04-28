import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  tasks, type Task, type InsertTask,
  activities, type Activity, type InsertActivity,
  TaskStatus
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getAllProjects(): Promise<Project[]>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getAllTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  countTasksByStatus(): Promise<{
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  
  // Dashboard operations
  getTasksDueSoon(): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private taskIdCounter: number;
  private activityIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.taskIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with some default users
    this.createUser({
      username: "mwilson",
      password: "password",
      fullName: "Margaret Wilson",
      role: "Project Manager",
      initials: "MW",
      avatarColor: "#0078D4"
    });
    
    this.createUser({
      username: "rjohnson",
      password: "password",
      fullName: "Robert Johnson",
      role: "Sustainability Specialist",
      initials: "RJ",
      avatarColor: "#D83B01"
    });
    
    this.createUser({
      username: "dparker",
      password: "password",
      fullName: "David Parker",
      role: "Energy Expert",
      initials: "DP",
      avatarColor: "#107C10"
    });
    
    this.createUser({
      username: "sjones",
      password: "password",
      fullName: "Sarah Jones",
      role: "Community Educator",
      initials: "SJ",
      avatarColor: "#605E5C"
    });
    
    this.createUser({
      username: "tgreen",
      password: "password",
      fullName: "Thomas Green",
      role: "Environmental Specialist",
      initials: "TG",
      avatarColor: "#605E5C"
    });
    
    // Create default project
    const project = this.createProject({
      name: "Community Sustainability Project",
      description: "Initiatives for building sustainable community practices"
    });
    
    // Create some default tasks
    this.createTask({
      title: "Solar Panel Installation Guidelines",
      description: "Create documentation for community solar installation",
      status: "in-progress",
      priority: "high",
      dueDate: new Date("2023-07-15"),
      projectId: project.id,
      assigneeId: 2 // Robert Johnson
    });
    
    this.createTask({
      title: "Community Garden Planning",
      description: "Design layouts for seasonal planting schedule",
      status: "completed",
      priority: "medium",
      dueDate: new Date("2023-06-30"),
      projectId: project.id,
      assigneeId: 1 // Margaret Wilson
    });
    
    this.createTask({
      title: "Rainwater Collection System",
      description: "Research and design efficient collection solutions",
      status: "new",
      priority: "low",
      dueDate: new Date("2023-08-05"),
      projectId: project.id,
      assigneeId: 5 // Thomas Green
    });
    
    this.createTask({
      title: "Composting Workshop",
      description: "Organize educational session for community members",
      status: "overdue",
      priority: "medium",
      dueDate: new Date("2023-06-10"),
      projectId: project.id,
      assigneeId: 4 // Sarah Jones
    });
    
    this.createTask({
      title: "Energy Audit Guidelines",
      description: "Develop standards for community home energy assessments",
      status: "in-progress",
      priority: "high",
      dueDate: new Date("2023-07-20"),
      projectId: project.id,
      assigneeId: 3 // David Parker
    });
    
    // Create activities
    this.createActivity({
      type: "task-completed",
      description: "completed Community Garden Planning",
      userId: 1,
      taskId: 2,
      projectId: project.id
    });
    
    this.createActivity({
      type: "comment-added",
      description: "commented on Solar Panel Installation Guidelines",
      userId: 2,
      taskId: 1,
      projectId: project.id
    });
    
    this.createActivity({
      type: "task-updated",
      description: "updated the due date for Energy Audit Guidelines",
      userId: 3,
      taskId: 5,
      projectId: project.id
    });
    
    this.createActivity({
      type: "task-created",
      description: "created a new task Rainwater Collection System",
      userId: 5,
      taskId: 3,
      projectId: project.id
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...userData 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: now, 
      updatedAt: now,
      status: project.status || 'active',
      description: project.description || null,
      icon: project.icon || null,
      parentId: project.parentId || null,
      isPublic: project.isPublic ?? true,
      customFields: project.customFields || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { 
      ...project, 
      ...projectData,
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Also delete related tasks
    const projectTasks = await this.getTasksByProject(id);
    projectTasks.forEach(task => this.tasks.delete(task.id));
    
    return this.projects.delete(id);
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  // Task methods
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: now, 
      updatedAt: now,
      status: task.status || 'new',
      priority: task.priority || 'medium',
      description: task.description || null,
      progress: task.progress || 0,
      estimatedHours: task.estimatedHours || null,
      spentHours: task.spentHours || 0,
      dueDate: task.dueDate || null,
      startDate: task.startDate || null,
      taskTypeId: task.taskTypeId || null,
      projectId: task.projectId || null,
      assigneeId: task.assigneeId || null,
      reporterId: task.reporterId || null,
      parentTaskId: task.parentTaskId || null,
      customFields: task.customFields || null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...taskData,
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    // Check for subtasks and delete them first
    const subtasks = Array.from(this.tasks.values())
      .filter(task => task.parentTaskId === id);
    
    subtasks.forEach(subtask => this.tasks.delete(subtask.id));
    
    return this.tasks.delete(id);
  }
  
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }
  
  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      status, 
      updatedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async countTasksByStatus(): Promise<{
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    const tasks = Array.from(this.tasks.values());
    const total = tasks.length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => task.status === 'overdue').length;
    
    return {
      total,
      inProgress,
      completed,
      overdue
    };
  }
  
  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: now 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, limit);
  }
  
  // Dashboard methods
  async getTasksDueSoon(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => {
        if (!task.dueDate) return false;
        // Get tasks due in the future or recently overdue
        const dueDate = new Date(task.dueDate);
        return dueDate > new Date();
      })
      .sort((a, b) => {
        // Sort by dueDate in ascending order (earliest first)
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      });
  }
}

import { DbStorage } from './db-storage';

// Use DbStorage when DATABASE_URL is available, otherwise fall back to MemStorage
export const storage = process.env.DATABASE_URL 
  ? new DbStorage() 
  : new MemStorage();
