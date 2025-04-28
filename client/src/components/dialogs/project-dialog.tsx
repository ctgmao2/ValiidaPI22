import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

interface ProjectDialogProps {
  mode: "create" | "edit";
  projectId?: number;
  trigger?: ReactNode;
  defaultValues?: any;
}

export function ProjectDialog({
  mode,
  projectId,
  trigger,
  defaultValues,
}: ProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formReady, setFormReady] = useState(mode === "create");

  // Fetch project data if in edit mode
  const { data: projectData, isLoading } = useQuery<Project>({
    queryKey: projectId ? ['/api/projects', projectId] : ['disabled-query'],
    enabled: mode === "edit" && !!projectId && open,
  });

  // Update formReady state when loading completes or mode is create
  useEffect(() => {
    if (mode === "create") {
      setFormReady(true);
    } else if (mode === "edit") {
      setFormReady(!isLoading && !!projectData);
    }
  }, [mode, isLoading, projectData]);

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
  const formValues = mode === "edit" && projectData
    ? { 
        ...projectData
      }
    : defaultValues || {};

  // Simple console debug
  useEffect(() => {
    if (open) {
      console.log(`ProjectDialog: mode=${mode}, projectId=${projectId}, formReady=${formReady}`);
      console.log("FormValues:", formValues);
    }
  }, [open, formReady, projectData, mode, projectId, formValues]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {mode === "create" ? "New Project" : "Edit Project"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new project to your workspace. Fill out the form below to create a project."
              : "Update the project details using the form below."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {formReady ? (
            <ProjectForm
              key={formKey}
              mode={mode}
              projectId={projectId}
              defaultValues={formValues}
              onSuccess={() => setOpen(false)}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading project data...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}