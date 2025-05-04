import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project, ProjectStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, FolderTree, ChevronRight, ChevronDown, Users, CalendarDays, 
  FileText, Clock, Settings, Layers, ExternalLink, Activity, Edit, MoreHorizontal,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ProjectDialog } from "@/components/dialogs/project-dialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectWithSubprojects extends Project {
  subprojects?: ProjectWithSubprojects[];
}

export default function Projects() {
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Organize projects into a hierarchy
  const organizeProjectHierarchy = (projects: Project[] | undefined): ProjectWithSubprojects[] => {
    if (!projects) return [];
    
    const projectMap: Record<number, ProjectWithSubprojects> = {};
    const rootProjects: ProjectWithSubprojects[] = [];
    
    // First pass: Create a map of all projects
    projects.forEach(project => {
      projectMap[project.id] = { ...project, subprojects: [] };
    });
    
    // Second pass: Organize into hierarchy
    projects.forEach(project => {
      if (project.parentId) {
        if (projectMap[project.parentId]) {
          if (!projectMap[project.parentId].subprojects) {
            projectMap[project.parentId].subprojects = [];
          }
          projectMap[project.parentId].subprojects?.push(projectMap[project.id]);
        } else {
          rootProjects.push(projectMap[project.id]);
        }
      } else {
        rootProjects.push(projectMap[project.id]);
      }
    });
    
    return rootProjects;
  };

  const toggleExpand = (projectId: number) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Filter projects based on the active tab
  const filteredProjects = (projects || []).filter(project => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return project.status === ProjectStatus.ACTIVE;
    if (activeTab === "archived") return project.status === ProjectStatus.ARCHIVED;
    if (activeTab === "completed") return project.status === ProjectStatus.COMPLETED;
    return true;
  });

  const hierarchicalProjects = organizeProjectHierarchy(filteredProjects);

  // Render a project card
  const renderProjectCard = (project: ProjectWithSubprojects, level = 0) => {
    const isExpanded = expandedProjects[project.id] || false;
    const hasSubprojects = project.subprojects && project.subprojects.length > 0;

    return (
      <div key={project.id} className={cn("mb-4", level > 0 && "ml-6 mt-2 border-l-2 pl-4 border-gray-200")}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {hasSubprojects && (
                  <button 
                    onClick={() => toggleExpand(project.id)} 
                    className="mr-2 text-gray-500 hover:text-primary"
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5" /> : 
                      <ChevronRight className="h-5 w-5" />
                    }
                  </button>
                )}
                <div>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.status && (
                      <Badge 
                        className="ml-2" 
                        variant={
                          project.status === "active" ? "default" : 
                          project.status === "archived" ? "secondary" : 
                          "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm text-neutral-500 mt-1">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {hasSubprojects && (
                  <Badge variant="outline" className="flex items-center">
                    <FolderTree className="h-3 w-3 mr-1" />
                    {project.subprojects?.length} subproject{project.subprojects!.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <ProjectDialog 
                        mode="edit" 
                        projectId={project.id}
                        trigger={
                          <div className="flex items-center cursor-pointer w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </div>
                        }
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <ConfirmDeleteDialog
                        resourceType="project"
                        resourceId={project.id}
                        resourceName={project.name}
                        userId={1} // Typically this would come from auth context
                        queryKeysToInvalidate={['/api/projects']}
                        trigger={
                          <div className="flex items-center cursor-pointer w-full text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </div>
                        }
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">{project.description}</p>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>5 members</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-1" />
                <span>12 tasks</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>3 events</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-3 flex flex-wrap gap-2">
            <Link href={`/projects/${project.id}/wiki`}>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <FileText className="h-4 w-4 mr-1" />
                Wiki
              </Button>
            </Link>
            
            <Link href={`/projects/${project.id}/tasks`}>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Layers className="h-4 w-4 mr-1" />
                Tasks
              </Button>
            </Link>
            
            <Link href={`/projects/${project.id}/time`}>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Clock className="h-4 w-4 mr-1" />
                Time
              </Button>
            </Link>
            
            <Link href={`/projects/${project.id}/manage`}>
              <Button variant="default" size="sm" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {hasSubprojects && isExpanded && (
          <div className="mt-2">
            {project.subprojects?.map(subproject => renderProjectCard(subproject, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Projects</h1>
              <p className="mt-1 text-neutral-500">Manage your sustainable community projects</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button variant="outline">
                <FolderTree className="-ml-1 mr-2 h-5 w-5" />
                Import
              </Button>
              <ProjectDialog
                mode="create"
                trigger={
                  <Button>
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Project
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator className="mb-6" />

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {hierarchicalProjects.length > 0 ? (
              hierarchicalProjects.map(project => renderProjectCard(project))
            ) : (
              <div className="text-center py-10">
                <FolderTree className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab !== "all" 
                    ? `No ${activeTab} projects found. Try changing the filter or create a new project.`
                    : "Get started by creating a new project."
                  }
                </p>
                <div className="mt-6">
                  <ProjectDialog
                    mode="create"
                    trigger={
                      <Button>
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        New Project
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
