import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { ReactNode, useEffect, useState } from "react";
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
  const [formKey, setFormKey] = useState(0); 
  const [formReady, setFormReady] = useState(mode === "create");

  // Fetch task data if in edit mode
  const { data: taskData, isLoading } = useQuery<Task>({
    queryKey: taskId ? ['/api/tasks', taskId] : ['disabled-query'],
    enabled: mode === "edit" && !!taskId && open,
  });

  // Update formReady state when loading completes or mode is create
  useEffect(() => {
    if (mode === "create") {
      setFormReady(true);
    } else if (mode === "edit") {
      setFormReady(!isLoading && !!taskData);
    }
  }, [mode, isLoading, taskData]);

  // When dialog opens or closes
  const handleOpenChange = (newOpenState: boolean) => {
    // Reset form ready state when dialog closes
    if (!newOpenState && open) {
      setFormReady(mode === "create");
    }
    
    // Force form to remount when dialog opens
    if (newOpenState && !open) {
      setFormKey(prev => prev + 1);
      // For edit mode, we'll wait for data to load
      setFormReady(mode === "create");
    }
    
    setOpen(newOpenState);
  };

  // Prepare the form values (with defaults for empty fields)
  const formValues = (() => {
    if (mode === "edit" && taskData) {
      return { 
        ...taskData,
        // Convert string dates to Date objects for the form
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        // Handle optional fields with proper defaults
        description: taskData.description || "",
        estimatedHours: taskData.estimatedHours || null,
        spentHours: taskData.spentHours || 0,
        progress: taskData.progress || 0,
        // Handle relations with proper null handling
        taskTypeId: taskData.taskTypeId || null,
        projectId: taskData.projectId || null,
        assigneeId: taskData.assigneeId || null,
        reporterId: taskData.reporterId || null,
        parentTaskId: taskData.parentTaskId || null
      };
    }
    return defaultValues || {} as Record<string, any>;
  })();

  // Simple console debug
  useEffect(() => {
    if (open) {
      console.log(`TaskDialog: mode=${mode}, taskId=${taskId}, formReady=${formReady}`);
      console.log("FormValues:", formValues);
    }
  }, [open, formReady, taskData, mode, taskId, formValues]);

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
          {formReady ? (
            <TaskForm
              key={formKey}
              mode={mode}
              taskId={taskId}
              defaultValues={formValues}
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