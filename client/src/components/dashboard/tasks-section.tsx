import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task, User } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TasksSectionProps {
  tasks: Task[];
}

export default function TasksSection({ tasks }: TasksSectionProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);
  
  // Get users for displaying assignees
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  const getUserById = (id: number | null | undefined) => {
    if (!id || !users) return null;
    return users.find(user => user.id === id);
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-600">Recent Tasks</h2>
        <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium">View All</a>
      </div>
      
      <Card className="overflow-hidden border border-neutral-200">
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
              {paginatedTasks.map((task) => {
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
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Showing {startIndex + 1} to {Math.min(endIndex, tasks.length)} of {tasks.length} tasks
            </div>
            <div>
              <nav className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className={`border-neutral-300 bg-white ${
                        pageNum === page ? 'text-primary' : 'text-neutral-500'
                      } hover:bg-neutral-50`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
