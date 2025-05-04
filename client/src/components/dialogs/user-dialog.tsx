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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactNode, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/lib/types";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.string().optional(),
  initials: z.string().min(1, "Initials are required"),
  avatarColor: z.string().min(3, "Please select a color"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserDialogProps {
  mode: "create" | "edit";
  userId?: number;
  trigger?: ReactNode;
}

export function UserDialog({ mode, userId, trigger }: UserDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data if in edit mode
  const { data: userData, isLoading } = useQuery<User>({
    queryKey: userId ? ['/api/users', userId] : ['disabled-query'],
    enabled: mode === "edit" && !!userId && open,
  });
  
  // Form ready state to control rendering
  const [formReady, setFormReady] = useState(mode === "create");
  
  // Update formReady state when data loads
  useEffect(() => {
    if (mode === "create") {
      setFormReady(true);
    } else if (mode === "edit") {
      setFormReady(!isLoading && !!userData);
    }
  }, [mode, isLoading, userData]);

  // Create form with validation
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: mode === "create" ? "" : undefined,
      email: "",
      fullName: "",
      role: "",
      initials: "",
      avatarColor: mode === "create" ? "#4f46e5" : "", // Default color
    }
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (mode === "edit" && userData) {
      const user = userData as User;
      console.log("UserDialog: Got user data for edit", user);
      
      form.reset({
        username: user.username,
        email: user.email || "",
        fullName: user.fullName,
        role: user.role || "",
        initials: user.initials,
        avatarColor: user.avatarColor,
      });
    }
  }, [form, userData, mode]);
  
  // Debug logging
  useEffect(() => {
    if (open) {
      console.log(`UserDialog: mode=${mode}, userId=${userId}, formReady=${formReady}`);
      console.log("Form values:", form.getValues());
    }
  }, [open, formReady, mode, userId, form]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      return apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User created successfully.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive"
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // Don't send empty password in updates
      if (!data.password) {
        const { password, ...restData } = data;
        return apiRequest("PATCH", `/api/users/${userId}`, restData);
      }
      return apiRequest("PATCH", `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      }
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: UserFormValues) {
    if (mode === "create") {
      createUserMutation.mutate(data);
    } else {
      updateUserMutation.mutate(data);
    }
  }

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
      if (mode === "create") {
        form.reset();
      }
    }
    
    setOpen(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>{mode === "create" ? "Create User" : "Edit User"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New User" : "Edit User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system."
              : "Update user information and settings."}
          </DialogDescription>
        </DialogHeader>
        
        {!formReady ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Leave blank to keep current password" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initials</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Initials (e.g., JD)" 
                        maxLength={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your initials (1-3 characters) for profile display
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: field.value }}
                        />
                        <Input 
                          type="color" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {mode === "create" ? "Create" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}