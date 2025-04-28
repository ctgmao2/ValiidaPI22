import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { 
  users, projects, tasks, activities,
  User, InsertUser, 
  Project, InsertProject, 
  Task, InsertTask, 
  Activity, InsertActivity,
  TaskStatus, ActivityType
} from '../shared/schema';
import { IStorage } from './storage';

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
      
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db
      .update(projects)
      .set({ 
        ...projectData,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
      
    return result[0];
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Delete all related tasks first
    await db
      .delete(tasks)
      .where(eq(tasks.projectId, id));
      
    // Then delete the project
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
      
    return result.length > 0;
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ 
        ...taskData,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
      
    // Create an activity record for this update
    await db.insert(activities).values({
      type: ActivityType.TASK_UPDATED,
      description: `Task updated: ${result[0]?.title || 'Unknown task'}`,
      taskId: id
    });
      
    return result[0];
  }
  
  async deleteTask(id: number): Promise<boolean> {
    // Delete any subtasks first
    await db
      .delete(tasks)
      .where(eq(tasks.parentTaskId, id));
      
    // Then delete the task
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
      
    return result.length > 0;
  }

  async getAllTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    
    // Add an activity record for this update
    const activityDescription = `Task status updated to ${status}`;
    await db.insert(activities).values({
      type: ActivityType.TASK_UPDATED,
      description: activityDescription,
      taskId: id
      // createdAt is added automatically by the database
    });
    
    return result[0];
  }

  async countTasksByStatus(): Promise<{
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    const allTasks = await this.getAllTasks();
    
    const total = allTasks.length;
    const inProgress = allTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const completed = allTasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    
    // Determine overdue tasks (tasks not completed with a due date in the past)
    const now = new Date();
    const overdue = allTasks.filter(task => {
      if (task.status === TaskStatus.COMPLETED) return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < now;
    }).length;
    
    return { total, inProgress, completed, overdue };
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return db.select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    const result = await db.select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    return result;
  }

  // Dashboard operations
  async getTasksDueSoon(): Promise<Task[]> {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => {
      if (task.status === TaskStatus.COMPLETED) return false;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= nextWeek;
    });
  }
}