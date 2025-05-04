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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ReactNode, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  memberIds: z.array(z.number()).min(1, "Team must have at least one member"),
  leaderId: z.number().optional(),
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users for dropdown
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
      icon: "",
      memberIds: [],
      leaderId: undefined,
    }
  });

  // Update form values when team data is loaded
  useEffect(() => {
    if (mode === "edit" && teamData) {
      form.reset({
        name: teamData.name,
        description: teamData.description || "",
        icon: teamData.icon || "",
        memberIds: teamData.memberIds || [],
        leaderId: teamData.leaderId,
      });
    }
  }, [form, teamData, mode]);

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      return apiRequest("POST", "/api/teams", data);
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
      return apiRequest("PATCH", `/api/teams/${teamId}`, data);
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
    if (mode === "create") {
      createTeamMutation.mutate(data);
    } else {
      updateTeamMutation.mutate(data);
    }
  }

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      setFormKey(prev => prev + 1);
      form.reset();
    }
    setOpen(newOpenState);
  };

  // Helper to get user name by ID
  const getUserName = (userId: number) => {
    if (!users) return `User #${userId}`;
    const user = users.find((u: any) => u.id === userId);
    return user ? (user.name || user.username) : `User #${userId}`;
  };

  // Handle adding team members
  const addMember = (userId: number) => {
    const currentMembers = form.getValues().memberIds || [];
    if (!currentMembers.includes(userId)) {
      form.setValue('memberIds', [...currentMembers, userId]);
    }
  };

  // Handle removing team members
  const removeMember = (userId: number) => {
    const currentMembers = form.getValues().memberIds || [];
    form.setValue('memberIds', currentMembers.filter(id => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>{mode === "create" ? "Create Team" : "Edit Team"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Team" : "Edit Team"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new team and add members."
              : "Update team details and membership."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && mode === "edit" ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading team data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                        placeholder="Enter team description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Icon name or URL" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Enter an icon name or image URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Team Members</FormLabel>
                {users && users.length > 0 ? (
                  <Select
                    onValueChange={(value) => addMember(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add team members" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.watch('memberIds')?.map((memberId) => (
                    <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                      {getUserName(memberId)}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeMember(memberId)}
                      />
                    </Badge>
                  ))}
                </div>
                
                <FormField
                  control={form.control}
                  name="memberIds"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="leaderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Leader</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team leader (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.watch('memberIds')?.map((memberId) => (
                          <SelectItem key={memberId} value={memberId.toString()}>
                            {getUserName(memberId)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional. Select a team member to be the leader.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  {mode === "create" ? "Create Team" : "Update Team"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}