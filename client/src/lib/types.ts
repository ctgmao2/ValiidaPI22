import { User as BaseUser, Task as BaseTask, Project, Activity } from "@shared/schema";

export type User = BaseUser;
export type Task = BaseTask;

export interface TaskWithAssignee extends Task {
  assignee?: User | null;
}

export interface ActivityWithDetails extends Activity {
  user?: User | null;
  task?: Task | null;
}

export interface DashboardStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
