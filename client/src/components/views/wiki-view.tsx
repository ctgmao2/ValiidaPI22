import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Search, FolderTree } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';

export function WikiView({ projectId }: { projectId: number }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: wikiPages, isLoading } = useQuery({
    queryKey: ['/api/projects', projectId, 'wiki'],
    enabled: !!projectId,
  });

  const renderWikiPages = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Loading wiki pages...</p>
        </div>
      );
    }

    if (!wikiPages || (Array.isArray(wikiPages) && wikiPages.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Wiki Pages</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            This project doesn't have any wiki pages yet. Create your first wiki page to document
            important project information.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create First Wiki Page
          </Button>
        </div>
      );
    }
    
    // This is a placeholder as we don't have real wiki pages yet
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="p-4">
              <CardTitle className="text-md">Project Overview</CardTitle>
              <CardDescription>Last updated 2 days ago</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">
                This page contains the key information about the project scope, objectives, and timeline.
                It serves as the central reference point for all project stakeholders.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 items-center max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wiki pages..."
              className="pl-8 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Wiki Page
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Pages</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {renderWikiPages()}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="recent" className="mt-6">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="flex flex-col">
              <p className="text-muted-foreground text-center py-8">
                Recently updated pages will appear here.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="structure" className="mt-6">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="flex flex-col items-center justify-center py-12">
              <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Wiki Structure</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                The hierarchical structure of your wiki will be displayed here.
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}