import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Project, Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Calendar,
  CalendarDays,
  BarChart3,
  Play,
  Pause,
  Timer,
  User
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectTime() {
  const { toast } = useToast();
  const [location] = useLocation();
  const projectId = location.startsWith('/projects/') ? parseInt(location.split('/')[2]) : null;
  const [activeTab, setActiveTab] = useState("entries");

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
          <p className="text-center py-12">Loading time tracking data...</p>
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

  // Sample time entries data for demonstration
  const timeEntries = [
    { id: 1, taskId: 1, taskTitle: 'Solar Panel Installation Guidelines', userId: 1, userName: 'John Doe', hours: 2.5, date: '2025-04-27', comment: 'Researched installation requirements' },
    { id: 2, taskId: 3, taskTitle: 'Energy Audit Checklist', userId: 1, userName: 'John Doe', hours: 1.5, date: '2025-04-27', comment: 'Created draft checklist structure' },
    { id: 3, taskId: 1, taskTitle: 'Solar Panel Installation Guidelines', userId: 2, userName: 'Jane Smith', hours: 3, date: '2025-04-26', comment: 'Drafted installation procedures' },
    { id: 4, taskId: 4, taskTitle: 'Recycling Campaign Materials', userId: 3, userName: 'Mark Lee', hours: 4, date: '2025-04-25', comment: 'Designed campaign poster' },
    { id: 5, taskId: 2, taskTitle: 'Community Garden Planning', userId: 1, userName: 'John Doe', hours: 2, date: '2025-04-24', comment: 'Site survey and planning' },
  ];

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
              <p className="text-neutral-500 mt-1">Time Tracking</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                    <DialogDescription>
                      Record time spent on a task for this project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="task" className="text-right">
                        Task
                      </label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTasks.map(task => (
                            <SelectItem key={task.id} value={String(task.id)}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="date" className="text-right">
                        Date
                      </label>
                      <Input
                        id="date"
                        type="date"
                        className="col-span-3"
                        defaultValue={new Date().toISOString().substring(0, 10)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="hours" className="text-right">
                        Hours
                      </label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.25"
                        min="0.25"
                        className="col-span-3"
                        placeholder="Enter time in hours"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="comment" className="text-right">
                        Comment
                      </label>
                      <Textarea
                        id="comment"
                        placeholder="What did you work on?"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Save Entry</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Timer className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">13.5h</div>
                <p className="text-xs text-muted-foreground">Project total</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7h</div>
                <p className="text-xs text-muted-foreground">Current week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Your Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6h</div>
                <p className="text-xs text-muted-foreground">Your contribution</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="entries">
                <Clock className="h-4 w-4 mr-2" />
                Time Entries
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="entries" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by user" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="1">John Doe</SelectItem>
                          <SelectItem value="2">Jane Smith</SelectItem>
                          <SelectItem value="3">Mark Lee</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="week">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>
                              <div className="font-medium">{entry.taskTitle}</div>
                              <div className="text-sm text-muted-foreground">
                                #{entry.taskId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {entry.userName.split(' ').map(part => part[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{entry.userName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{entry.hours}h</div>
                            </TableCell>
                            <TableCell>
                              <div className="line-clamp-1 max-w-[200px]">
                                {entry.comment}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Reports</CardTitle>
                  <CardDescription>
                    Analyze time spent across various dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to generate and view detailed time reports.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    Visualize time entries on a calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to view time entries in a calendar format.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}