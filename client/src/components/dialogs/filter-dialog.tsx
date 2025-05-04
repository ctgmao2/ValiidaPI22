import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Filter, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarInput } from "@/components/ui/calendar-input";

// Filter schema
const filterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  assignedToMe: z.boolean().optional(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  projectIds: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.string()).optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDialogProps {
  resourceType: "task" | "project" | "user";
  trigger?: ReactNode;
  statusOptions?: FilterOption[];
  priorityOptions?: FilterOption[];
  projectOptions?: FilterOption[];
  customFieldOptions?: {
    id: string;
    name: string;
    options?: FilterOption[];
  }[];
  initialFilters?: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export function FilterDialog({
  resourceType,
  trigger,
  statusOptions = [],
  priorityOptions = [],
  projectOptions = [],
  customFieldOptions = [],
  initialFilters,
  onApplyFilters,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialFilters || {
      searchTerm: "",
      status: [],
      priority: [],
      assignedToMe: false,
      startDate: null,
      dueDate: null,
      projectIds: [],
      customFields: {},
    },
  });

  const getResourceLabel = () => {
    switch (resourceType) {
      case "task":
        return "tasks";
      case "project":
        return "projects";
      case "user":
        return "users";
      default:
        return "items";
    }
  };

  const updateActiveFilters = (values: FilterValues) => {
    const filters: string[] = [];
    
    if (values.searchTerm) filters.push("Search");
    if (values.status && values.status.length > 0) filters.push("Status");
    if (values.priority && values.priority.length > 0) filters.push("Priority");
    if (values.assignedToMe) filters.push("Assigned to me");
    if (values.startDate) filters.push("Start date");
    if (values.dueDate) filters.push("Due date");
    if (values.projectIds && values.projectIds.length > 0) filters.push("Projects");
    
    // Add custom fields that have values
    if (values.customFields) {
      Object.entries(values.customFields).forEach(([key, value]) => {
        if (value) {
          const field = customFieldOptions.find(option => option.id === key);
          if (field) filters.push(field.name);
        }
      });
    }
    
    setActiveFilters(filters);
  };

  const onSubmit = (values: FilterValues) => {
    updateActiveFilters(values);
    onApplyFilters(values);
    setOpen(false);
  };

  const resetForm = () => {
    form.reset({
      searchTerm: "",
      status: [],
      priority: [],
      assignedToMe: false,
      startDate: null,
      dueDate: null,
      projectIds: [],
      customFields: {},
    });
    setActiveFilters([]);
    onApplyFilters({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter {getResourceLabel()}
          </DialogTitle>
          <DialogDescription>
            Apply filters to narrow down the list of {getResourceLabel()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Search ${getResourceLabel()} by name or keyword`}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
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
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={field.value?.includes(option.value) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer hover:opacity-80 transition-all",
                            field.value?.includes(option.value)
                              ? "bg-primary text-primary-foreground"
                              : "bg-transparent"
                          )}
                          onClick={() => {
                            const currentValues = field.value || [];
                            const newValues = currentValues.includes(option.value)
                              ? currentValues.filter((val) => val !== option.value)
                              : [...currentValues, option.value];
                            field.onChange(newValues);
                          }}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            {priorityOptions.length > 0 && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map((option) => (
                        <Badge
                          key={option.value}
                          variant={field.value?.includes(option.value) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer hover:opacity-80 transition-all",
                            field.value?.includes(option.value)
                              ? "bg-primary text-primary-foreground"
                              : "bg-transparent"
                          )}
                          onClick={() => {
                            const currentValues = field.value || [];
                            const newValues = currentValues.includes(option.value)
                              ? currentValues.filter((val) => val !== option.value)
                              : [...currentValues, option.value];
                            field.onChange(newValues);
                          }}
                        >
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            {resourceType === "task" && (
              <FormField
                control={form.control}
                name="assignedToMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Assigned to me</FormLabel>
                      <FormDescription>
                        Only show tasks that are assigned to you
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <CalendarInput
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Filter by start date"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <CalendarInput
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Filter by due date"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {resourceType === "task" && projectOptions.length > 0 && (
              <FormField
                control={form.control}
                name="projectIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projects</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select projects" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((projectId) => {
                          const project = projectOptions.find(
                            (p) => p.value === projectId
                          );
                          return (
                            <Badge
                              key={projectId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {project?.label || projectId}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter((id) => id !== projectId) || []
                                  );
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </FormItem>
                )}
              />
            )}

            {customFieldOptions.length > 0 && (
              <>
                <Separator />
                <h3 className="text-sm font-medium">Custom Fields</h3>

                {customFieldOptions.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`customFields.${field.id}` as any}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.name}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Filter by ${field.name.toLowerCase()}`}
                            {...formField}
                            value={formField.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset Filters
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}