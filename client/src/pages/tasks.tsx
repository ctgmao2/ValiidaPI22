import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filter, Plus, Search } from "lucide-react";
import { format } from "date-fns";

export default function Tasks() {
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStatus, setFilteredStatus] = useState<string | null>(null);
  
  // Filter tasks based on search term and status filter
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = 
      !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filteredStatus || task.status === filteredStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const getUserById = (id: number | null | undefined) => {
    if (!id || !users) return null;
    return users.find(user => user.id === id);
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
          
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative rounded-md shadow-sm flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 border-neutral-300"
                placeholder="Search tasks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filteredStatus === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredStatus(null)}
              >
                All
              </Button>
              <Button 
                variant={filteredStatus === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredStatus("new")}
              >
                New
              </Button>
              <Button 
                variant={filteredStatus === "in-progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredStatus("in-progress")}
              >
                In Progress
              </Button>
              <Button 
                variant={filteredStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilteredStatus("completed")}
              >
                Completed
              </Button>
            </div>
          </div>
        </div>
        
        {isLoadingTasks ? (
          <Card>
            <div className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Task</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Assignee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredTasks?.map((task) => {
                    const assignee = getUserById(task.assigneeId);
                    return (
                      <tr key={task.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-600">{task.title}</div>
                          <div className="text-sm text-neutral-500">{task.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignee ? (
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback bgColor={assignee.avatarColor}>{assignee.initials}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-neutral-600">{assignee.fullName}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">Unassigned</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.status as any} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority as any} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary-dark">Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {(filteredTasks?.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                        No tasks found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
