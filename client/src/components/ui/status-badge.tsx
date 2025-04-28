import { cn } from "@/lib/utils";
import { TaskStatus } from "@shared/schema";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusConfig = {
  [TaskStatus.NEW]: {
    label: "New",
    className: "bg-primary bg-opacity-10 text-primary status-new"
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "bg-warning bg-opacity-10 text-warning status-in-progress"
  },
  [TaskStatus.COMPLETED]: {
    label: "Completed",
    className: "bg-success bg-opacity-10 text-success status-complete"
  },
  [TaskStatus.OVERDUE]: {
    label: "Overdue",
    className: "bg-danger bg-opacity-10 text-danger"
  },
  [TaskStatus.RESOLVED]: {
    label: "Resolved",
    className: "bg-success bg-opacity-10 text-success"
  },
  [TaskStatus.FEEDBACK]: {
    label: "Feedback",
    className: "bg-info bg-opacity-10 text-info"
  },
  [TaskStatus.CLOSED]: {
    label: "Closed",
    className: "bg-neutral-300 text-neutral-600"
  },
  [TaskStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-danger bg-opacity-10 text-danger"
  }
};

// Default config for fallback
const defaultConfig = {
  label: "Unknown",
  className: "bg-neutral-100 text-neutral-500"
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Handle undefined or null status
  if (!status) {
    return (
      <span 
        className={cn(
          "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
          defaultConfig.className,
          className
        )}
      >
        {defaultConfig.label}
      </span>
    );
  }
  
  // Get config or use default if status is not in the config
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    className: defaultConfig.className
  };
  
  return (
    <span 
      className={cn(
        "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
