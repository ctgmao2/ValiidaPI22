import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Settings, Shield, Calendar } from "lucide-react";
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
                    Configure who can perform various actions within this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to configure project permissions.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Settings</CardTitle>
                  <CardDescription>
                    Configure calendar settings and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to configure calendar settings.
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