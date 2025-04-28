import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TaskDialogProps {
  mode: "create" | "edit";
  taskId?: number;
  trigger?: ReactNode;
  defaultValues?: any;
}

export function TaskDialog({
  mode,
  taskId,
  trigger,
  defaultValues,
}: TaskDialogProps) {
  const [open, setOpen] = useState(false);

  // If editing, fetch the current task data
  const { data: taskData } = useQuery({
    queryKey: taskId ? [`/api/tasks/${taskId}`] : null,
    enabled: mode === "edit" && !!taskId,
  });

  // Prepare form default values based on mode
  const formDefaultValues = mode === "edit" && taskData 
    ? {
        ...taskData,
        // Convert string dates to Date objects for the form
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      }
    : defaultValues;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {mode === "create" ? "New Task" : "Edit Task"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new task to your project. Fill out the form below to create a task."
              : "Update the task details using the form below."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TaskForm
            mode={mode}
            taskId={taskId}
            defaultValues={formDefaultValues}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}