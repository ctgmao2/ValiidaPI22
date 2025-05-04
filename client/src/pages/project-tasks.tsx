import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Project, Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckSquare,
  CircleDashed, 
  ListFilter,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  User,
  List,
  GanttChart,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDialog } from "@/components/dialogs/task-dialog";

export default function ProjectTasks() {
  const { toast } = useToast();
  const [location] = useLocation();
  const projectId = location.startsWith('/projects/') ? parseInt(location.split('/')[2]) : null;
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery<Project>({
    queryKey: projectId ? ['/api/projects', projectId] : ['disabled-query'],
    enabled: !!projectId,
  });

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    enabled: !!projectId,
  });

  // Filter tasks for this project
  const projectTasks = tasks?.filter(task => task.projectId === projectId) || [];
  
  // Apply status filter
  const filteredTasks = filter === "all" 
    ? projectTasks
    : projectTasks.filter(task => task.status === filter);

  useEffect(() => {
    if (projectError) {
      toast({
        title: "Error",
        description: "Failed to load project information",
        variant: "destructive"
      });
    }
    
    if (tasksError) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    }
  }, [projectError, tasksError, toast]);

  if (isLoadingProject || isLoadingTasks) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-center py-12">Loading project tasks...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>Project not found</CardTitle>
              <CardDescription>The project you're looking for doesn't exist or you don't have permission to view it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/projects">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <CircleDashed className="h-4 w-4 text-gray-500" />;
      case 'in-progress':
        return <CircleAlert className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CircleDashed className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center mb-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-neutral-500 mt-1">Task Management</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <TaskDialog 
                mode="create" 
                defaultValues={{ projectId }}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                }
              />
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Select defaultValue={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative w-full md:w-[260px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tasks..."
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Tabs value={viewMode} onValueChange={setViewMode} className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="list">
                        <List className="h-4 w-4 mr-2" />
                        List
                      </TabsTrigger>
                      <TabsTrigger value="gantt">
                        <GanttChart className="h-4 w-4 mr-2" />
                        Gantt
                      </TabsTrigger>
                      <TabsTrigger value="calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tasks found matching your criteria</p>
                  <TaskDialog 
                    mode="create"
                    defaultValues={{ projectId }}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create a Task
                      </Button>
                    }
                  />
                </div>
              ) : (
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="list" className="mt-0">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Priority</TableHead>
                            <TableHead className="w-[150px]">Assignee</TableHead>
                            <TableHead className="text-right w-[140px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">#{task.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {task.description || "No description"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <span className="capitalize">
                                    {task.status.replace(/-/g, ' ')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                              <TableCell>
                                {task.assigneeId ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {task.assigneeId === 1 ? "JD" : "??"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{task.assigneeId === 1 ? "John Doe" : "Assigned User"}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Unassigned</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <TaskDialog
                                  mode="edit"
                                  taskId={task.id}
                                  trigger={
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gantt" className="mt-0">
                    <div className="p-6 border rounded-md">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Gantt Chart View</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Today
                          </Button>
                          <Button variant="outline" size="sm">
                            Zoom In
                          </Button>
                          <Button variant="outline" size="sm">
                            Zoom Out
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border-t">
                        {/* Month Headers */}
                        <div className="flex border-b">
                          <div className="w-1/4 py-2 px-4 font-medium">Task</div>
                          <div className="w-3/4 flex">
                            {Array.from({ length: 6 }, (_, i) => {
                              const date = new Date();
                              date.setMonth(date.getMonth() + i);
                              return (
                                <div key={i} className="flex-1 py-2 px-2 text-center font-medium text-sm border-l">
                                  {date.toLocaleString('default', { month: 'short' })} {date.getFullYear()}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Tasks with timeline bars */}
                        {filteredTasks.map((task) => {
                          // Generate random position and length for demo
                          const startMonth = Math.floor(Math.random() * 3);
                          const duration = Math.floor(Math.random() * 3) + 1;
                          const statusColor = task.status === 'completed' ? 'bg-green-500' : 
                                            task.status === 'in-progress' ? 'bg-blue-500' :
                                            task.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500';
                          
                          return (
                            <div key={task.id} className="flex border-b hover:bg-gray-50">
                              <div className="w-1/4 py-3 px-4">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-xs text-muted-foreground">{task.status.replace(/-/g, ' ')}</div>
                              </div>
                              <div className="w-3/4 py-3 relative flex">
                                {Array.from({ length: 6 }, (_, i) => (
                                  <div key={i} className="flex-1 border-l"></div>
                                ))}
                                <div
                                  className={`absolute h-5 rounded-full ${statusColor} top-1/2 -translate-y-1/2`}
                                  style={{
                                    left: `${(startMonth / 6) * 100}%`,
                                    width: `${(duration / 6) * 100}%`,
                                  }}
                                >
                                  <div className="px-2 h-full flex items-center justify-center text-white text-xs font-medium">
                                    {task.title}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="calendar" className="mt-0">
                    <div className="p-6 border rounded-md">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Calendar View</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Today
                          </Button>
                          <div className="flex border rounded-md">
                            <Button variant="ghost" size="sm" className="rounded-none border-r">
                              Month
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-none border-r">
                              Week
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-none">
                              Day
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-px bg-gray-200 border rounded-md overflow-hidden">
                        {/* Day header */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <div key={i} className="bg-white p-2 text-center font-medium">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar cells */}
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date();
                          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                          const startingDay = firstDay.getDay();
                          const monthLength = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                          
                          const day = i - startingDay + 1;
                          const isCurrentMonth = day > 0 && day <= monthLength;
                          const isToday = day === date.getDate() && isCurrentMonth;
                          
                          // Randomly assign tasks to dates
                          const hasTasks = isCurrentMonth && Math.random() > 0.7;
                          
                          return (
                            <div 
                              key={i} 
                              className={`bg-white min-h-[100px] p-2 ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                            >
                              <div className="font-medium text-right">{isCurrentMonth ? day : ''}</div>
                              {hasTasks && (
                                <div className="mt-1">
                                  <div className="bg-blue-100 p-1 text-xs rounded mb-1 border-l-2 border-blue-500">
                                    Task #{Math.floor(Math.random() * filteredTasks.length) + 1}
                                  </div>
                                  {Math.random() > 0.5 && (
                                    <div className="bg-green-100 p-1 text-xs rounded border-l-2 border-green-500">
                                      Another task
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}