import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats, TaskWithAssignee, ActivityWithDetails } from "@/lib/types";
import ProjectOverview from "@/components/dashboard/project-overview";
import TasksSection from "@/components/dashboard/tasks-section";
import ActivitySection from "@/components/dashboard/activity-section";
import TeamSection from "@/components/dashboard/team-section";
import DueDatesSection from "@/components/dashboard/due-dates-section";
import { Filter, Plus } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<TaskWithAssignee[]>({
    queryKey: ['/api/tasks'],
  });
  
  const { data: activities, isLoading: isLoadingActivities } = useQuery<ActivityWithDetails[]>({
    queryKey: ['/api/activities/recent'],
  });
  
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const { data: dueTasks, isLoading: isLoadingDueTasks } = useQuery<TaskWithAssignee[]>({
    queryKey: ['/api/dashboard/due-soon'],
  });
  
  const isLoading = isLoadingStats || isLoadingTasks || isLoadingActivities || isLoadingUsers || isLoadingDueTasks;
  
  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Project Dashboard</h1>
              <p className="mt-1 text-neutral-500">Manage your community sustainability initiatives</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" size="sm" className="h-9 px-4">
                <Filter className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
                Filter
              </Button>
              <Button size="sm" className="h-9 px-4">
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Task
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-400 text-base"
                placeholder="Search tasks or projects"
              />
            </div>
          </div>
        </div>
        
        {/* Project Overview Section */}
        {isLoadingStats ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-600 mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="ml-4">
                      <Skeleton className="h-5 w-16 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <ProjectOverview stats={stats!} />
        )}
        
        {/* Tasks Section */}
        {isLoadingTasks ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-600">Recent Tasks</h2>
              <span className="text-primary hover:text-primary-dark text-sm font-medium">View All</span>
            </div>
            <Card>
              <div className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </div>
            </Card>
          </div>
        ) : (
          <TasksSection tasks={tasks!} />
        )}
        
        {/* Project Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          {isLoadingActivities ? (
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-600 mb-4">Recent Activity</h3>
                <Skeleton className="h-[400px] w-full" />
              </Card>
            </div>
          ) : (
            <ActivitySection activities={activities!} />
          )}
          
          {/* Project Team & Upcoming Due Dates */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            {/* Project Team */}
            {isLoadingUsers ? (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-neutral-600">Project Team</h3>
                  <span className="text-sm font-medium text-primary hover:text-primary-dark">Manage Team</span>
                </div>
                <Skeleton className="h-[200px] w-full" />
              </Card>
            ) : (
              <TeamSection users={users!} />
            )}
            
            {/* Upcoming Due Dates */}
            {isLoadingDueTasks ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-600 mb-4">Upcoming Due Dates</h3>
                <Skeleton className="h-[200px] w-full" />
              </Card>
            ) : (
              <DueDatesSection tasks={dueTasks!} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
