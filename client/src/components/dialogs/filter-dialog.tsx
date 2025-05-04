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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ReactNode, useState } from "react";

const filterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  showCompleted: z.boolean().optional(),
  showOverdue: z.boolean().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

interface FilterDialogProps {
  onFilter: (filters: FilterFormValues) => void;
  trigger?: ReactNode;
  filterType: "projects" | "tasks" | "users";
  defaultValues?: FilterFormValues;
}

export function FilterDialog({ onFilter, trigger, filterType, defaultValues }: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Define field options based on filter type
  const statusOptions = 
    filterType === "projects" 
      ? ["active", "completed", "on-hold", "cancelled"] 
      : filterType === "tasks"
      ? ["not-started", "in-progress", "review", "completed", "blocked"]
      : ["active", "inactive", "pending"];
      
  const priorityOptions = 
    filterType === "tasks" 
      ? ["low", "medium", "high", "critical"] 
      : [];

  // Create form with validation
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultValues || {
      searchTerm: "",
      status: "",
      priority: "",
      assignee: "",
      dueDate: "",
      showCompleted: true,
      showOverdue: true,
    },
  });

  function onSubmit(data: FilterFormValues) {
    onFilter(data);
    setOpen(false);
  }

  function handleReset() {
    form.reset({
      searchTerm: "",
      status: "",
      priority: "",
      assignee: "",
      dueDate: "",
      showCompleted: true,
      showOverdue: true,
    });
    
    onFilter({
      searchTerm: "",
      status: "",
      priority: "",
      assignee: "",
      dueDate: "",
      showCompleted: true,
      showOverdue: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Filter {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Set filter criteria to narrow down your results.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input placeholder="Search by name, title, description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {statusOptions.length > 0 && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {filterType === "tasks" && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any priority</SelectItem>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {filterType === "tasks" && (
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any assignee</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="me">Assigned to me</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {(filterType === "projects" || filterType === "tasks") && (
              <FormField
                control={form.control}
                name="showCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Completed</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
            {filterType === "tasks" && (
              <FormField
                control={form.control}
                name="showOverdue"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Show Overdue</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-between space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset Filters
              </Button>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Apply Filters
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}