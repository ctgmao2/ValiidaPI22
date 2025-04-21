import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter } from "lucide-react";

export default function Reports() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Prepare data for task status chart
  const getStatusChartData = () => {
    if (!tasks) return [];
    
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'New', value: statusCounts['new'] || 0 },
      { name: 'In Progress', value: statusCounts['in-progress'] || 0 },
      { name: 'Completed', value: statusCounts['completed'] || 0 },
      { name: 'Overdue', value: statusCounts['overdue'] || 0 }
    ];
  };
  
  // Prepare data for priority chart
  const getPriorityChartData = () => {
    if (!tasks) return [];
    
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'Low', value: priorityCounts['low'] || 0 },
      { name: 'Medium', value: priorityCounts['medium'] || 0 },
      { name: 'High', value: priorityCounts['high'] || 0 }
    ];
  };
  
  const pieColors = ['#0078D4', '#D83B01', '#107C10', '#D13438'];
  
  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Reports</h1>
              <p className="mt-1 text-neutral-500">View project metrics and statistics</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" size="sm" className="h-9 px-4">
                <Filter className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
                Filter
              </Button>
              <Button size="sm" className="h-9 px-4">
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {/* Task Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Task Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getStatusChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Tasks" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPriorityChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getPriorityChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Recent Task Updates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Task Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                {tasks?.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-neutral-600">{task.title}</h3>
                      <p className="text-sm text-neutral-500">
                        Last updated: {new Date(task.updatedAt).toLocaleDateString()} at {new Date(task.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <StatusBadge status={task.status as any} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Task Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-500">Total Tasks</h3>
                  <p className="text-2xl font-bold text-neutral-700 mt-1">{tasks?.length || 0}</p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-500">Completion Rate</h3>
                  <p className="text-2xl font-bold text-neutral-700 mt-1">
                    {tasks?.length ? 
                      Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-500">High Priority Tasks</h3>
                  <p className="text-2xl font-bold text-neutral-700 mt-1">
                    {tasks?.filter(t => t.priority === 'high').length || 0}
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-500">Overdue Tasks</h3>
                  <p className="text-2xl font-bold text-neutral-700 mt-1">
                    {tasks?.filter(t => t.status === 'overdue').length || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
