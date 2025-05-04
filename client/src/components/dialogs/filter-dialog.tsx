import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { ReactNode, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterDialogProps {
  resourceType: "user" | "project" | "task" | "team";
  statusOptions: Array<{ label: string; value: string }>;
  trigger?: ReactNode;
  onApplyFilters: (filters: FilterFormValues) => void;
}

const filterSchema = z.object({
  name: z.string().optional(),
  status: z.array(z.string()).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  assignedTo: z.string().optional(),
  priority: z.string().optional(),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export function FilterDialog({
  resourceType,
  statusOptions,
  trigger,
  onApplyFilters,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      name: "",
      status: [],
      fromDate: undefined,
      toDate: undefined,
      assignedTo: "",
      priority: "",
    },
  });

  function onSubmit(data: FilterFormValues) {
    onApplyFilters(data);
    setOpen(false);
  }

  function resetFilters() {
    form.reset({
      name: "",
      status: [],
      fromDate: undefined,
      toDate: undefined,
      assignedTo: "",
      priority: "",
    });
  }

  const resourceTypeLabel = 
    resourceType === "user" ? "user" :
    resourceType === "project" ? "project" :
    resourceType === "task" ? "task" : "team";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter {resourceTypeLabel}s</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your search
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name/Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Filter by ${resourceTypeLabel} name`}
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
              name="status"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Status</FormLabel>
                    <FormDescription>
                      Select the statuses you want to include
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {statusOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="status"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          option.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {resourceType === "task" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>From Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <div className="ml-auto flex">
                                  {field.value && (
                                    <XCircle
                                      className="h-4 w-4 mr-1 opacity-70 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(undefined);
                                      }}
                                    />
                                  )}
                                  <CalendarIcon className="h-4 w-4 opacity-50" />
                                </div>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>To Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <div className="ml-auto flex">
                                  {field.value && (
                                    <XCircle
                                      className="h-4 w-4 mr-1 opacity-70 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(undefined);
                                      }}
                                    />
                                  )}
                                  <CalendarIcon className="h-4 w-4 opacity-50" />
                                </div>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter className="pt-4 flex justify-between sm:justify-between gap-2">
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Apply Filters</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}