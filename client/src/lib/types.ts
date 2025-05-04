import { User as BaseUser, Task, Project, Activity } from "@shared/schema";

export type User = BaseUser;

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
