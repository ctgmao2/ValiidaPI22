import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task, User, Project, TaskStatus, TaskPriority } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Filter, Plus, Search, MoreHorizontal, Link2, Clock, CalendarDays, 
  Link, AlertCircle, Layers, UserCircle2, MessageCircle, FileText,
  ArrowUpRight, ChevronDown, ChevronUp, Star, CheckCircle2, ListFilter,
  MoreVertical, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define interfaces for enhanced task data
interface TaskWithRelations extends Task {
  project?: Project;
  assignee?: User;
  reporter?: User;
  dependencies?: Task[];
  dependents?: Task[];
  subtasks?: TaskWithRelations[];
  parentTask?: Task;
}

export default function Tasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for filters and view options
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);
  const [filteredPriority, setFilteredPriority] = useState<string | null>(null);
  const [filteredProject, setFilteredProject] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board" | "timeline">("list");
  const [showClosedTasks, setShowClosedTasks] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Fetch tasks data
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch users data
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch projects data
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Mutation for updating task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number, status: string }) => {
      return apiRequest(
        "PATCH",
        `/api/tasks/${taskId}/status`, 
        { status }
      );
    },
    onSuccess: () => {
      // Invalidate queries to refetch the tasks
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/recent'] });
      toast({
        title: "Task updated",
        description: "The task status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the task status.",
        variant: "destructive",
      });
    },
  });
  
  // Helper function to get user by id
  const getUserById = (id: number | null | undefined) => {
    if (!id || !users) return null;
    return users.find(user => user.id === id);
  };
  
  // Helper function to get project by id
  const getProjectById = (id: number | null | undefined) => {
    if (!id || !projects) return null;
    return projects.find(project => project.id === id);
  };
  
  // Helper function to toggle task expanded state
  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Helper function to handle status change
  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskStatus.mutate({ taskId, status: newStatus });
  };
  
  // Sort and filter tasks
  const sortAndFilterTasks = () => {
    if (!tasks) return [];
    
    const filtered = tasks.filter(task => {
      // Text search filter
      const matchesSearch = 
        !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = !filteredStatus || task.status === filteredStatus;
      
      // Priority filter
      const matchesPriority = !filteredPriority || task.priority === filteredPriority;
      
      // Project filter
      const matchesProject = !filteredProject || task.projectId === filteredProject;
      
      // Show/hide completed tasks
      const matchesCompletion = showClosedTasks || 
        (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CLOSED);
      
      return matchesSearch && matchesStatus && matchesPriority && 
             matchesProject && matchesCompletion;
    });
    
    // Sort tasks
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      // Determine sort values based on field
      switch(sortField) {
        case 'dueDate':
          valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case 'priority':
          const priorityOrder = { high: 0, urgent: 1, medium: 2, low: 3 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999;
          break;
        case 'status':
          const statusOrder = { 'overdue': 0, 'in-progress': 1, 'new': 2, 'completed': 3 };
          valueA = statusOrder[a.status as keyof typeof statusOrder] || 999;
          valueB = statusOrder[b.status as keyof typeof statusOrder] || 999;
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        default:
          valueA = a[sortField as keyof Task] || '';
          valueB = b[sortField as keyof Task] || '';
      }
      
      // Apply sort direction
      return sortDirection === 'asc' 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });
  };
  
  // Calculate the task dependents and task dependencies
  const enhanceTasksWithRelations = (tasks: Task[]): TaskWithRelations[] => {
    if (!tasks) return [];
    
    const taskMap: Record<number, TaskWithRelations> = {};
    
    // Create a map of all tasks
    tasks.forEach(task => {
      taskMap[task.id] = { 
        ...task, 
        dependencies: [], 
        dependents: [],
        subtasks: []
      };
    });
    
    // Organize tasks into parent-child relationships
    tasks.forEach(task => {
      if (task.parentTaskId && taskMap[task.parentTaskId]) {
        taskMap[task.parentTaskId].subtasks = taskMap[task.parentTaskId].subtasks || [];
        taskMap[task.parentTaskId].subtasks?.push(taskMap[task.id]);
        taskMap[task.id].parentTask = taskMap[task.parentTaskId];
      }
    });
    
    // Add project and user data
    Object.values(taskMap).forEach(task => {
      if (task.projectId) {
        const project = getProjectById(task.projectId);
        if (project) task.project = project;
      }
      
      if (task.assigneeId) {
        const assignee = getUserById(task.assigneeId);
        if (assignee) task.assignee = assignee;
      }
      
      if (task.reporterId) {
        const reporter = getUserById(task.reporterId);
        if (reporter) task.reporter = reporter;
      }
    });
    
    // Return the root tasks (tasks with no parent)
    return Object.values(taskMap).filter(task => !task.parentTaskId);
  };
  
  const filteredAndSortedTasks = sortAndFilterTasks();
  const enhancedTasks = enhanceTasksWithRelations(filteredAndSortedTasks);
  
  // Render a single task row
  const renderTaskRow = (task: TaskWithRelations, level = 0): JSX.Element => {
    const isExpanded = expandedTasks[task.id] || false;
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const indentClass = level > 0 ? `pl-${level * 6}` : '';
    
    return (
      <>
        <TableRow key={task.id} className={cn("group hover:bg-neutral-50")}>
          <TableCell className={cn("font-medium", indentClass)}>
            <div className="flex items-start">
              {hasSubtasks && (
                <button 
                  onClick={() => toggleTaskExpanded(task.id)} 
                  className="mr-2 text-gray-500 hover:text-primary"
                >
                  {isExpanded ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronUp className="h-5 w-5" />
                  }
                </button>
              )}
              <div>
                <div className="flex items-center">
                  <span className="mr-2 text-neutral-400">#{task.id}</span>
                  <span className="font-medium text-neutral-900">{task.title}</span>
                  {task.parentTaskId && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <Link className="h-3 w-3 mr-1" />
                      Subtask
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <div className="text-sm text-neutral-500 line-clamp-1 mt-1">
                    {task.description}
                  </div>
                )}
              </div>
            </div>
          </TableCell>
          
          <TableCell>
            {task.project && (
              <Badge 
                variant="outline" 
                className="font-normal hover:bg-primary/10 cursor-pointer"
                onClick={() => setFilteredProject(task.project?.id || null)}
              >
                {task.project.name}
              </Badge>
            )}
          </TableCell>
          
          <TableCell>
            {task.assignee ? (
              <div className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: task.assignee.avatarColor }}>
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-sm font-medium text-neutral-900">{task.assignee.fullName}</div>
                  <div className="text-xs text-neutral-500">{task.assignee.role}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Unassigned</div>
            )}
          </TableCell>
          
          <TableCell>
            <Select
              value={task.status}
              onValueChange={(value) => handleStatusChange(task.id, value)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={task.status as any} />
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TaskStatus).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={value as any} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          
          <TableCell>
            <PriorityBadge priority={task.priority as any} />
          </TableCell>
          
          <TableCell>
            {task.dueDate ? (
              <div className="flex items-center text-sm">
                <CalendarDays className="h-4 w-4 mr-1.5 text-neutral-500" />
                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </div>
            ) : (
              <span className="text-neutral-400">-</span>
            )}
          </TableCell>
          
          <TableCell>
            {task.progress !== undefined && task.progress > 0 ? (
              <div className="w-full">
                <Progress value={task.progress} max={100} className="h-2" />
                <div className="text-xs text-right mt-1 text-neutral-500">{task.progress}%</div>
              </div>
            ) : (
              <span className="text-neutral-400">0%</span>
            )}
          </TableCell>
          
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Edit task</DropdownMenuItem>
                <DropdownMenuItem>Add comment</DropdownMenuItem>
                <DropdownMenuItem>Log time</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Add subtask</DropdownMenuItem>
                <DropdownMenuItem>Add related task</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        
        {hasSubtasks && isExpanded && task.subtasks?.map(subtask => 
          renderTaskRow(subtask, level + 1)
        )}
      </>
    );
  };

  // Component for the kanban board view
  const KanbanBoardView = () => {
    // Group tasks by status
    const tasksByStatus: Record<string, TaskWithRelations[]> = {};
    
    // Initialize columns for all statuses
    Object.values(TaskStatus).forEach(status => {
      tasksByStatus[status] = [];
    });
    
    // Group tasks by status
    enhancedTasks.forEach(task => {
      // Only include top-level tasks in the kanban view
      if (!task.parentTaskId && task.status) {
        if (!tasksByStatus[task.status]) {
          tasksByStatus[task.status] = [];
        }
        tasksByStatus[task.status].push(task);
      }
    });
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="flex flex-col h-full">
            <div className="p-2 bg-neutral-100 rounded-t-md border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center">
                <StatusBadge status={status as any} />
                <span className="ml-2 text-sm font-medium">{statusTasks.length}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden border-x border-neutral-200 bg-neutral-50">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-2 space-y-2">
                  {statusTasks.map(task => (
                    <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">#{task.id}</span>
                          <PriorityBadge priority={task.priority as any} className="text-xs" />
                        </div>
                        
                        <h3 className="font-medium line-clamp-2 mb-2">{task.title}</h3>
                        
                        {task.project && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {task.project.name}
                          </Badge>
                        )}
                        
                        <div className="flex justify-between items-center mt-2">
                          {task.assignee ? (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback style={{ backgroundColor: task.assignee.avatarColor }}>
                                {task.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <UserCircle2 className="h-6 w-6 text-neutral-300" />
                          )}
                          
                          <div className="flex items-center text-xs text-neutral-500 space-x-2">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                {format(new Date(task.dueDate), 'MMM dd')}
                              </div>
                            )}
                            
                            {(task.subtasks?.length || 0) > 0 && (
                              <div className="flex items-center">
                                <Layers className="h-3 w-3 mr-1" />
                                {task.subtasks?.length}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {statusTasks.length === 0 && (
                    <div className="p-4 text-center text-sm text-neutral-400">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="p-2 bg-neutral-100 rounded-b-md border border-t-0 border-neutral-200">
              <Button variant="ghost" size="sm" className="w-full text-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add task
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Tasks</h1>
              <p className="mt-1 text-neutral-500">Manage and track project tasks</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <ListFilter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm" 
                onClick={() => setShowClosedTasks(!showClosedTasks)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {showClosedTasks ? "Hide Closed" : "Show Closed"}
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="text"
                className="pl-10 border-neutral-300"
                placeholder="Search tasks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filteredProject?.toString() || ""} onValueChange={(v) => setFilteredProject(v ? parseInt(v) : null)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="board">Board View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant={filteredStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilteredStatus(null)}
            >
              All
            </Button>
            {Object.entries(TaskStatus).map(([key, value]) => (
              <Button 
                key={key}
                variant={filteredStatus === value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredStatus(value)}
              >
                <StatusBadge status={value as any} className="mr-2" />
                {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
              </Button>
            ))}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              variant={filteredPriority === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilteredPriority(null)}
            >
              All Priorities
            </Button>
            {Object.entries(TaskPriority).map(([key, value]) => (
              <Button 
                key={key}
                variant={filteredPriority === value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredPriority(value)}
              >
                <PriorityBadge priority={value as any} className="mr-2" />
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue="tasks" className="mb-6">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-4">
            {isLoadingTasks ? (
              <Card>
                <div className="p-6">
                  <Skeleton className="h-[400px] w-full" />
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                {viewMode === "board" ? (
                  <KanbanBoardView />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enhancedTasks.length > 0 ? (
                          enhancedTasks.map(task => renderTaskRow(task))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center text-neutral-500">
                                <Layers className="h-12 w-12 mb-2 text-neutral-300" />
                                <p>No tasks found matching your criteria</p>
                                <Button variant="link" onClick={() => {
                                  setSearchTerm("");
                                  setFilteredStatus(null);
                                  setFilteredPriority(null);
                                  setFilteredProject(null);
                                }}>
                                  Clear all filters
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <Separator />
                
                <div className="p-4 text-sm text-neutral-500">
                  Showing {enhancedTasks.length} {enhancedTasks.length === 1 ? "task" : "tasks"}
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="gantt">
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium">Gantt Chart View</h3>
              <p className="text-neutral-500 mt-2">
                This feature is coming soon. Check back later!
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium">Calendar View</h3>
              <p className="text-neutral-500 mt-2">
                This feature is coming soon. Check back later!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
