import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= Basic Tables - No References =============

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role"),
  initials: text("initials").notNull(),
  avatarColor: text("avatar_color").notNull(),
  email: text("email"),
  preferences: jsonb("preferences")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  initials: true,
  avatarColor: true,
  email: true,
  preferences: true
});

// Roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  permissions: true
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // Self-reference defined below
  status: text("status").notNull().default("active"),
  icon: text("icon"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  customFields: jsonb("custom_fields")
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  parentId: true,
  status: true,
  icon: true,
  isPublic: true,
  customFields: true
});

// Custom Fields Definition
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull(), // text, number, date, etc.
  description: text("description"),
  required: boolean("required").default(false),
  defaultValue: text("default_value"),
  possibleValues: jsonb("possible_values"), // For dropdown fields
  appliesTo: text("applies_to").notNull(), // projects, tasks, users, etc.
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertCustomFieldSchema = createInsertSchema(customFields).pick({
  name: true,
  fieldType: true,
  description: true,
  required: true,
  defaultValue: true,
  possibleValues: true,
  appliesTo: true
});

// ============= First Level Dependencies =============

// Self-reference for projects is handled in SQL definition

// Task Types
export const taskTypes = pgTable("task_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  projectId: integer("project_id").references(() => projects.id), // If task type is project-specific
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertTaskTypeSchema = createInsertSchema(taskTypes).pick({
  name: true,
  description: true,
  icon: true,
  color: true,
  projectId: true
});

// User Role Assignments
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
  projectId: true
});

// Tasks (Issues in Redmine)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("medium"),
  progress: integer("progress").default(0), // Percentage of completion
  estimatedHours: integer("estimated_hours"),
  spentHours: integer("spent_hours").default(0),
  dueDate: timestamp("due_date"),
  startDate: timestamp("start_date"),
  taskTypeId: integer("task_type_id").references(() => taskTypes.id),
  projectId: integer("project_id").references(() => projects.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  reporterId: integer("reporter_id").references(() => users.id),
  parentTaskId: integer("parent_task_id"), // Self-reference defined below
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  progress: true,
  estimatedHours: true,
  spentHours: true,
  dueDate: true,
  startDate: true,
  taskTypeId: true,
  projectId: true,
  assigneeId: true,
  reporterId: true,
  parentTaskId: true,
  customFields: true
});

// ============= Second Level Dependencies =============

// Self-reference for tasks is handled in SQL definition

// Task Dependencies
export const taskDependencies = pgTable("task_dependencies", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  dependsOnTaskId: integer("depends_on_task_id").references(() => tasks.id).notNull(),
  dependencyType: text("dependency_type").notNull().default("blocks"), // blocks, precedes, etc.
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertTaskDependencySchema = createInsertSchema(taskDependencies).pick({
  taskId: true,
  dependsOnTaskId: true,
  dependencyType: true
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  taskId: true,
  projectId: true
});

// Time Entries
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  hours: integer("hours").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  spentOn: timestamp("spent_on").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  hours: true,
  description: true,
  userId: true,
  taskId: true,
  projectId: true,
  spentOn: true
});

// Wiki Pages
export const wikiPages = pgTable("wiki_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  parentPageId: integer("parent_page_id"), // Self-reference defined below
  authorId: integer("author_id").references(() => users.id).notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertWikiPageSchema = createInsertSchema(wikiPages).pick({
  title: true,
  content: true,
  projectId: true,
  parentPageId: true,
  authorId: true
});

// Self-reference for wiki pages is handled in SQL definition

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  allDay: true,
  projectId: true,
  taskId: true,
  creatorId: true
});

// ============= Final Level Dependencies =============

// Activities (for audit log and notifications)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  projectId: integer("project_id").references(() => projects.id),
  wikiPageId: integer("wiki_page_id").references(() => wikiPages.id),
  commentId: integer("comment_id").references(() => comments.id),
  timeEntryId: integer("time_entry_id").references(() => timeEntries.id),
  details: jsonb("details"), // Additional details about the activity
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  description: true,
  userId: true,
  taskId: true,
  projectId: true,
  wikiPageId: true,
  commentId: true,
  timeEntryId: true,
  details: true
});

// ============= Type Definitions =============

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type TaskType = typeof taskTypes.$inferSelect;
export type InsertTaskType = z.infer<typeof insertTaskTypeSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskDependency = typeof taskDependencies.$inferSelect;
export type InsertTaskDependency = z.infer<typeof insertTaskDependencySchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type WikiPage = typeof wikiPages.$inferSelect;
export type InsertWikiPage = z.infer<typeof insertWikiPageSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// ============= Enums =============

export const TaskStatus = {
  NEW: "new",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
  FEEDBACK: "feedback",
  CLOSED: "closed",
  REJECTED: "rejected",
  COMPLETED: "completed",
  OVERDUE: "overdue"
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
  IMMEDIATE: "immediate"
} as const;

export const ProjectStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  COMPLETED: "completed"
} as const;

export const DependencyType = {
  BLOCKS: "blocks",
  PRECEDES: "precedes",
  RELATES_TO: "relates_to",
  DUPLICATES: "duplicates",
  INCLUDES: "includes"
} as const;

export const ActivityType = {
  TASK_CREATED: "task-created",
  TASK_UPDATED: "task-updated",
  TASK_COMPLETED: "task-completed",
  TASK_ASSIGNED: "task-assigned",
  COMMENT_ADDED: "comment-added",
  TIME_LOGGED: "time-logged",
  PROJECT_CREATED: "project-created",
  PROJECT_UPDATED: "project-updated",
  WIKI_UPDATED: "wiki-updated",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left"
} as const;
