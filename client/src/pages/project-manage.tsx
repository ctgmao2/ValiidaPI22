import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Settings, Shield, Calendar } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "wouter";

export default function ProjectManage() {
  const { toast } = useToast();
  const [, params] = useParams();
  const projectId = params ? parseInt(params) : null;

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
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to configure general project settings.
                  </p>
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
                <CardContent>
                  <p className="text-neutral-500">
                    This section is under development. Here you'll be able to manage project members.
                  </p>
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