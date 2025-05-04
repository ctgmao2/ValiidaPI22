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
import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  resourceType: "user" | "project" | "task" | "comment" | "team";
  resourceId: number;
  resourceName: string;
  trigger?: ReactNode;
  userId?: number;
  queryKeysToInvalidate: string[];
}

export function ConfirmDeleteDialog({
  resourceType,
  resourceId,
  resourceName,
  trigger,
  userId,
  queryKeysToInvalidate,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create appropriate API endpoint based on resource type
  const getApiEndpoint = () => {
    switch (resourceType) {
      case "user":
        return `/api/users/${resourceId}`;
      case "project":
        return `/api/projects/${resourceId}`;
      case "task":
        return `/api/tasks/${resourceId}`;
      case "comment":
        return `/api/comments/${resourceId}`;
      case "team":
        return `/api/teams/${resourceId}`;
      default:
        return "";
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = getApiEndpoint();
      if (!endpoint) throw new Error("Invalid resource type");
      return apiRequest("DELETE", endpoint);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryKeysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      
      // Additional specific query invalidation
      if (resourceType === "task" && userId) {
        queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "tasks"] });
      }
      
      toast({
        title: "Success",
        description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} deleted successfully.`,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${resourceType}.`,
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this {resourceType}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete <strong>{resourceName}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}