import { Card } from "@/components/ui/card";
import { TaskWithAssignee } from "@/lib/types";
import { format, differenceInDays, isBefore } from "date-fns";

interface DueDatesSectionProps {
  tasks: TaskWithAssignee[];
}

export default function DueDatesSection({ tasks }: DueDatesSectionProps) {
  // Helper function to get remaining days text and class
  const getRemainingDaysInfo = (dueDate: Date) => {
    const today = new Date();
    const isOverdue = isBefore(dueDate, today);
    const daysDiff = Math.abs(differenceInDays(dueDate, today));
    
    if (isOverdue) {
      return {
        text: "Overdue",
        className: "bg-danger bg-opacity-10 text-danger"
      };
    } else if (daysDiff <= 3) {
      return {
        text: `${daysDiff} day${daysDiff !== 1 ? 's' : ''} left`,
        className: "bg-warning bg-opacity-10 text-warning"
      };
    } else {
      return {
        text: `${daysDiff} days left`,
        className: "bg-neutral-200 text-neutral-500"
      };
    }
  };
  
  return (
    <Card className="p-6 border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-600 mb-4">Upcoming Due Dates</h3>
      
      <div className="space-y-4">
        {tasks.map((task) => {
          if (!task.dueDate) return null;
          
          const dueDate = new Date(task.dueDate);
          const dayInfo = getRemainingDaysInfo(dueDate);
          const dueDateDay = format(dueDate, 'd');
          
          return (
            <div key={task.id} className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 ${task.status === 'overdue' ? 'bg-danger' : 'bg-primary'} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <span className="text-lg font-semibold text-primary">{dueDateDay}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">{task.title}</p>
                <p className="text-xs text-neutral-500">Due {format(dueDate, 'MMMM d, yyyy')}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${dayInfo.className}`}>
                  {dayInfo.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
