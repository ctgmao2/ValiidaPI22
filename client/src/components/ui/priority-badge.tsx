import { cn } from "@/lib/utils";

type PriorityBadgeProps = {
  priority: "low" | "medium" | "high";
  className?: string;
};

const priorityConfig = {
  "low": {
    label: "Low",
    className: "bg-neutral-200 text-neutral-500"
  },
  "medium": {
    label: "Medium",
    className: "bg-warning bg-opacity-10 text-warning"
  },
  "high": {
    label: "High",
    className: "bg-danger bg-opacity-10 text-danger"
  }
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
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
