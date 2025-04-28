import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

  // If editing, fetch the current project data
  const { data: projectData, isLoading } = useQuery({
    queryKey: projectId ? ['/api/projects', projectId] : ['disabled-query'],
    enabled: mode === "edit" && !!projectId,
  });

  // Show loading in edit mode until data is available
  const isReady = mode === "create" || (mode === "edit" && (projectData || isLoading === false));
  
  // Prepare form default values based on mode
  const formDefaultValues = mode === "edit" && projectData 
    ? projectData 
    : defaultValues || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {isReady ? (
            <ProjectForm
              mode={mode}
              projectId={projectId}
              defaultValues={formDefaultValues}
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