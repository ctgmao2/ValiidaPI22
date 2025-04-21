import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "new" | "in-progress" | "completed" | "overdue";
  className?: string;
};

const statusConfig = {
  "new": {
    label: "New",
    className: "bg-primary bg-opacity-10 text-primary status-new"
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-warning bg-opacity-10 text-warning status-in-progress"
  },
  "completed": {
    label: "Completed",
    className: "bg-success bg-opacity-10 text-success status-complete"
  },
  "overdue": {
    label: "Overdue",
    className: "bg-danger bg-opacity-10 text-danger"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
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
