import { cn } from "@/lib/utils";
import { TaskPriority } from "@shared/schema";

type PriorityBadgeProps = {
  priority: string;
  className?: string;
};

const priorityConfig = {
  [TaskPriority.LOW]: {
    label: "Low",
    className: "bg-neutral-200 text-neutral-500"
  },
  [TaskPriority.MEDIUM]: {
    label: "Medium",
    className: "bg-warning bg-opacity-10 text-warning"
  },
  [TaskPriority.HIGH]: {
    label: "High",
    className: "bg-danger bg-opacity-10 text-danger"
  },
  [TaskPriority.URGENT]: {
    label: "Urgent",
    className: "bg-danger bg-opacity-20 text-danger"
  },
  [TaskPriority.IMMEDIATE]: {
    label: "Immediate",
    className: "bg-danger text-white"
  }
};

// Default config for fallback
const defaultConfig = {
  label: "Unknown",
  className: "bg-neutral-100 text-neutral-500"
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  // Handle undefined or null priority
  if (!priority) {
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
  
  // Get config or use default if priority is not in the config
  const config = priorityConfig[priority as keyof typeof priorityConfig] || {
    label: priority.charAt(0).toUpperCase() + priority.slice(1),
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
