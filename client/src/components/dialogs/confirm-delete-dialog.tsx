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
import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  entityType: "task" | "project" | "user" | "comment";
  entityId: number;
  entityName?: string;
  trigger?: ReactNode;
  onSuccess?: () => void;
  invalidateQueries?: string[];
}

export function ConfirmDeleteDialog({
  entityType,
  entityId,
  entityName,
  trigger,
  onSuccess,
  invalidateQueries = [],
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create entity-type specific endpoint and messages
  const endpoint = `/api/${entityType}s/${entityId}`;
  const title = `Delete ${entityType[0].toUpperCase() + entityType.slice(1)}`;
  const description = `Are you sure you want to delete this ${entityType}${
    entityName ? `: "${entityName}"` : ""
  }? This action cannot be undone.`;
  const successMessage = `${entityType[0].toUpperCase() + entityType.slice(1)} deleted successfully.`;

  // Default queries to invalidate based on entity type
  const defaultQueriesToInvalidate = [
    `/api/${entityType}s`,
    "/api/dashboard/stats",
    "/api/activities/recent",
  ];

  // Combine default queries with any additional ones
  const queriesToInvalidate = [...new Set([...defaultQueriesToInvalidate, ...invalidateQueries])];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", endpoint);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      
      toast({
        title: "Deleted",
        description: successMessage,
      });
      
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}