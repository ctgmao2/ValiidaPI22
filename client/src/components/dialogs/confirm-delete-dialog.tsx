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

interface ConfirmDeleteDialogProps {
  resourceType: string;
  resourceId: number;
  resourceName?: string;
  userId: number; // ID of the user performing the delete action (for activity logging)
  queryKeysToInvalidate: string[];
  trigger?: ReactNode;
}

export function ConfirmDeleteDialog({
  resourceType,
  resourceId,
  resourceName,
  userId,
  queryKeysToInvalidate,
  trigger,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const displayName = resourceName || `${resourceType} #${resourceId}`;

  const deleteResourceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/${resourceType}s/${resourceId}`, { userId });
    },
    onSuccess: () => {
      // Invalidate all specified query keys
      for (const key of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      
      toast({
        title: "Deleted",
        description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} was deleted successfully.`,
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${resourceType}.`,
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this {resourceType}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete <strong>{displayName}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteResourceMutation.mutate();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteResourceMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}