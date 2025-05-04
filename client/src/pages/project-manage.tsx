import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Shield, 
  Calendar, 
  MoreHorizontal 
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function ProjectManage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const projectId = location.startsWith('/projects/') ? parseInt(location.split('/')[2]) : null;

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: projectId ? ['/api/projects', projectId] : ['disabled-query'],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load project information",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-center py-12">Loading project information...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
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

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center mb-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-neutral-500 mt-1">{project.description}</p>
          </div>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                General Settings
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general settings for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="project-name">
                            Project Name
                          </label>
                          <Input
                            id="project-name"
                            defaultValue={project.name}
                            placeholder="Enter project name"
                          />
                          <p className="text-[0.8rem] text-muted-foreground">
                            The name of the project as it appears throughout the system
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="project-description">
                            Project Description
                          </label>
                          <Textarea
                            id="project-description"
                            defaultValue={project.description || ""}
                            placeholder="Enter project description"
                            rows={4}
                          />
                          <p className="text-[0.8rem] text-muted-foreground">
                            A brief description of the project's goals and scope
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="project-identifier">
                            Project Identifier
                          </label>
                          <Input
                            id="project-identifier"
                            defaultValue={project.id.toString()}
                            placeholder="Enter project identifier"
                          />
                          <p className="text-[0.8rem] text-muted-foreground">
                            A short identifier used in URLs and references (e.g., GCI)
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="project-homepage">
                            Homepage URL
                          </label>
                          <Input
                            id="project-homepage"
                            defaultValue={""}
                            placeholder="https://example.com"
                            type="url"
                          />
                          <p className="text-[0.8rem] text-muted-foreground">
                            Optional external homepage for the project
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Status
                          </label>
                          <Select defaultValue={project.status || "active"}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[0.8rem] text-muted-foreground">
                            The current status of this project
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="default" type="button">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>
                    Manage who has access to this project and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Current Members</h3>
                      <Button size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Added On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center rounded-full w-8 h-8" style={{ backgroundColor: "#4f46e5", color: "white" }}>
                                  MW
                                </div>
                                <div>
                                  <p className="font-medium">Margaret Wilson</p>
                                  <p className="text-sm text-muted-foreground">mwilson</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Project Manager</Badge>
                            </TableCell>
                            <TableCell>Apr 15, 2025</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Change Role</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center rounded-full w-8 h-8" style={{ backgroundColor: "#06b6d4", color: "white" }}>
                                  JS
                                </div>
                                <div>
                                  <p className="font-medium">John Smith</p>
                                  <p className="text-sm text-muted-foreground">jsmith</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Developer</Badge>
                            </TableCell>
                            <TableCell>Apr 18, 2025</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Change Role</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Invite New Members</h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user1">Amy Lee (alee)</SelectItem>
                            <SelectItem value="user2">David Chen (dchen)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-[200px]">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Project Manager</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button>Add to Project</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>
                    Configure which roles can perform various actions within this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Role Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Set which project roles have access to specific permissions
                    </p>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Permission</TableHead>
                            <TableHead className="text-center">Project Manager</TableHead>
                            <TableHead className="text-center">Developer</TableHead>
                            <TableHead className="text-center">Viewer</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">View Tasks</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="view-tasks-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="view-tasks-dev" defaultChecked />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="view-tasks-viewer" defaultChecked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Create Tasks</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="create-tasks-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="create-tasks-dev" defaultChecked />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="create-tasks-viewer" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Edit Tasks</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-tasks-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-tasks-dev" defaultChecked />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-tasks-viewer" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Delete Tasks</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="delete-tasks-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="delete-tasks-dev" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="delete-tasks-viewer" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Manage Team</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="manage-team-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="manage-team-dev" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="manage-team-viewer" />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Edit Wiki</TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-wiki-pm" defaultChecked disabled />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-wiki-dev" defaultChecked />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox id="edit-wiki-viewer" />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="default" type="button">
                      Save Permissions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Settings</CardTitle>
                  <CardDescription>
                    Configure calendar display options and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Date Format</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how dates are displayed throughout the project
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-start space-x-3">
                          <div>
                            <RadioGroup defaultValue="brazilian">
                              <div className="flex items-center space-x-2 mb-3">
                                <RadioGroupItem value="american" id="date-format-american" />
                                <Label htmlFor="date-format-american">American Format (MM-DD-YYYY)</Label>
                              </div>
                              <div className="flex items-center space-x-2 mb-3">
                                <RadioGroupItem value="brazilian" id="date-format-brazilian" />
                                <Label htmlFor="date-format-brazilian">Brazilian Format (DD-MM-YYYY)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="iso" id="date-format-iso" />
                                <Label htmlFor="date-format-iso">ISO Format (YYYY-MM-DD)</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="p-4 border rounded-md">
                          <h4 className="text-sm font-medium mb-2">Preview</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">American Format:</span>
                              <span>05-04-2025</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Brazilian Format:</span>
                              <span>04-05-2025</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">ISO Format:</span>
                              <span>2025-05-04</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Time Format</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Switch id="use-24-hour" />
                            <Label htmlFor="use-24-hour">Use 24-hour time format</Label>
                          </div>
                          <p className="text-[0.8rem] text-muted-foreground mt-2">
                            When enabled, times will be shown in 24-hour format (14:30) instead of 12-hour format (2:30 PM)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Calendar View</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="default-calendar-view">Default Calendar View</Label>
                          <Select defaultValue="month">
                            <SelectTrigger id="default-calendar-view">
                              <SelectValue placeholder="Select view" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="month">Month view</SelectItem>
                              <SelectItem value="week">Week view</SelectItem>
                              <SelectItem value="day">Day view</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[0.8rem] text-muted-foreground mt-2">
                            Sets the default calendar view when users access the calendar
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="first-day-of-week">First Day of Week</Label>
                          <Select defaultValue="sunday">
                            <SelectTrigger id="first-day-of-week">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunday">Sunday</SelectItem>
                              <SelectItem value="monday">Monday</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[0.8rem] text-muted-foreground mt-2">
                            Sets which day appears as the first day of the week
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="default" type="button">
                        Save Settings
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}