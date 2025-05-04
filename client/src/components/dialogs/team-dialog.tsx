import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/lib/types";
import { DataTable } from "../ui/data-table";
import { Check, Plus, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
  memberIds: z.array(z.number()).optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamDialogProps {
  mode: "create" | "edit";
  teamId?: number;
  trigger?: ReactNode;
}

export function TeamDialog({ mode, teamId, trigger }: TeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users for member selection
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: open,
  });

  // Fetch team data if in edit mode
  const { data: teamData, isLoading } = useQuery({
    queryKey: teamId ? ['/api/teams', teamId] : ['disabled-query'],
    enabled: mode === "edit" && !!teamId && open,
  });

  // Create form with validation
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      memberIds: [],
    }
  });

  // Update available users when users data is loaded
  useEffect(() => {
    if (users) {
      setAvailableUsers(users as User[]);
    }
  }, [users]);

  // Update form values and selected members when team data is loaded
  useEffect(() => {
    if (mode === "edit" && teamData) {
      form.reset({
        name: (teamData as any).name,
        description: (teamData as any).description || "",
        memberIds: (teamData as any).memberIds || [],
      });
      
      setSelectedMembers((teamData as any).memberIds || []);
    }
  }, [form, teamData, mode]);

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      return apiRequest("POST", "/api/teams", {
        ...data,
        memberIds: selectedMembers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "Team created successfully.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team.",
        variant: "destructive"
      });
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      return apiRequest("PATCH", `/api/teams/${teamId}`, {
        ...data,
        memberIds: selectedMembers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      if (teamId) {
        queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
      }
      toast({
        title: "Success",
        description: "Team updated successfully.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: TeamFormValues) {
    const formData = {
      ...data,
      memberIds: selectedMembers,
    };
    
    if (mode === "create") {
      createTeamMutation.mutate(formData);
    } else {
      updateTeamMutation.mutate(formData);
    }
  }

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      setFormKey(prev => prev + 1);
      form.reset();
      setSelectedMembers([]);
    }
    setOpen(newOpenState);
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Columns for the available users table
  const availableUsersColumns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: User } }) => {
        const userId = row.original.id;
        const isSelected = selectedMembers.includes(userId);
        
        return (
          <Button
            variant={isSelected ? "destructive" : "outline"}
            size="sm"
            onClick={() => toggleMember(userId)}
          >
            {isSelected ? (
              <>
                <X className="h-4 w-4 mr-1" /> Remove
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> Add
              </>
            )}
          </Button>
        );
      },
    },
  ];

  // Get the selected users for the table
  const selectedUsersData = availableUsers.filter(user => 
    selectedMembers.includes(user.id)
  );

  // Columns for the selected members table
  const selectedMembersColumns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: User } }) => {
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toggleMember(row.original.id)}
          >
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>{mode === "create" ? "Create Team" : "Edit Team"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Team" : "Edit Team"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new team and assign members."
              : "Update team information and members."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && mode === "edit" ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading team data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Team description" 
                        rows={3} 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Team Members</h3>
                
                {selectedMembers.length > 0 ? (
                  <div className="space-y-2">
                    <FormLabel>Selected Members</FormLabel>
                    <DataTable
                      columns={selectedMembersColumns}
                      data={selectedUsersData}
                      emptyMessage="No members selected"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No members selected.</p>
                )}
                
                <div className="space-y-2">
                  <FormLabel>Available Users</FormLabel>
                  <ScrollArea className="h-[200px]">
                    <DataTable
                      columns={availableUsersColumns}
                      data={availableUsers}
                      emptyMessage="No users available"
                    />
                  </ScrollArea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
                >
                  {mode === "create" ? "Create Team" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}