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
import type { Task } from "@shared/schema";

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
  const [key, setKey] = useState(0); // Add key to force re-render of form

  // If editing, fetch the current task data
  const { data: taskData, isLoading } = useQuery<Task>({
    queryKey: taskId ? ['/api/tasks', taskId] : ['disabled-query'],
    enabled: mode === "edit" && !!taskId,
  });

  // Show loading in edit mode until data is available
  const isReady = mode === "create" || (mode === "edit" && !isLoading);
  
  // Prepare form default values based on mode
  const formDefaultValues = mode === "edit" && taskData 
    ? {
        ...taskData,
        // Convert string dates to Date objects for the form
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
      }
    : defaultValues || {} as Record<string, any>; // Type assertion to avoid TS errors

  // Handle dialog open state changes
  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState !== open) {
      setOpen(newOpenState);
      // Increment key when reopening to force form reset
      if (newOpenState) {
        setKey(prev => prev + 1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          {isReady ? (
            <TaskForm
              key={key} // Force re-render when dialog is opened
              mode={mode}
              taskId={taskId}
              defaultValues={formDefaultValues}
              onSuccess={() => setOpen(false)}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading task data...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}