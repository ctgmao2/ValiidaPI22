import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus, FileText, Menu } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectWiki() {
  const { toast } = useToast();
  const [, params] = useParams("/projects/:id/wiki");
  const projectId = params?.id ? parseInt(params.id) : null;

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-neutral-500 mt-1">Project Documentation and Wiki</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Menu className="h-4 w-4 mr-2" />
                Table of Contents
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Wiki Pages</h3>
              <ul className="space-y-1">
                <li className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                  <Link href="#" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </li>
                <li className="px-2 py-1 hover:bg-muted rounded">
                  <Link href="#" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Project Guidelines
                  </Link>
                </li>
                <li className="px-2 py-1 hover:bg-muted rounded">
                  <Link href="#" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Technical Documentation
                  </Link>
                </li>
                <li className="px-2 py-1 hover:bg-muted rounded">
                  <Link href="#" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Meeting Notes
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Home Page</CardTitle>
                    <CardDescription>Last updated on {new Date().toLocaleDateString()}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h2>Welcome to the {project.name} Project Wiki</h2>
                  <p>
                    This wiki serves as the central knowledge repository for the {project.name} project.
                    Here you'll find documentation, guidelines, and important information about the project.
                  </p>
                  <h3>Project Overview</h3>
                  <p>
                    {project.description}
                  </p>
                  <h3>Getting Started</h3>
                  <p>
                    To get started with the project, please review the Project Guidelines page which 
                    contains information about project standards, workflows, and processes.
                  </p>
                  <h3>Recent Updates</h3>
                  <ul>
                    <li>Initial wiki setup completed</li>
                    <li>Project overview documentation added</li>
                    <li>Team member responsibilities defined</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}