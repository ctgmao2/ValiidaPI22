import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ResourceType = "task" | "project" | "user";

interface ConfirmDeleteDialogProps {
  resourceType: ResourceType;
  resourceId: number;
  resourceName: string;
  onDeleteSuccess?: () => void;
  trigger?: ReactNode;
  queryKeysToInvalidate?: string[];
  userId?: number;
}

export function ConfirmDeleteDialog({
  resourceType,
  resourceId,
  resourceName,
  onDeleteSuccess,
  trigger,
  queryKeysToInvalidate = [],
  userId,
}: ConfirmDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Map resource types to their API endpoints
  const resourceEndpoints: Record<ResourceType, string> = {
    task: `/api/tasks/${resourceId}`,
    project: `/api/projects/${resourceId}`,
    user: `/api/users/${resourceId}`,
  };

  // Always invalidate these queries based on resource type
  const defaultInvalidations: string[] = [];
  if (resourceType === "task") {
    defaultInvalidations.push("/api/tasks");
    defaultInvalidations.push("/api/activities/recent");
    defaultInvalidations.push("/api/dashboard/stats");
    defaultInvalidations.push("/api/dashboard/due-soon");
  } else if (resourceType === "project") {
    defaultInvalidations.push("/api/projects");
    defaultInvalidations.push("/api/tasks"); // Invalidate tasks as they might be affected
    defaultInvalidations.push("/api/activities/recent");
    defaultInvalidations.push("/api/dashboard/stats");
  } else if (resourceType === "user") {
    defaultInvalidations.push("/api/users");
  }

  // Add any custom invalidations
  defaultInvalidations.push(...queryKeysToInvalidate);

  // Create delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", resourceEndpoints[resourceType], userId ? { userId } : undefined);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      defaultInvalidations.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      
      toast({
        title: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} deleted`,
        description: `${resourceName} has been deleted successfully.`,
      });
      
      // Close the dialog
      setOpen(false);
      
      // Call the success callback
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete ${resourceType}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {resourceType}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{resourceName}"? This action cannot be undone.
            {resourceType === "project" && 
              " All tasks associated with this project will also be deleted."}
            {resourceType === "task" && 
              " Any subtasks will also be deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}