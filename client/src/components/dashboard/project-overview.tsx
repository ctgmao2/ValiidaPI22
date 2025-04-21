import { DashboardStats } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, ClipboardList, AlertTriangle } from "lucide-react";

interface ProjectOverviewProps {
  stats: DashboardStats;
}

export default function ProjectOverview({ stats }: ProjectOverviewProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Project Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Total Tasks */}
        <Card className="bg-white p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-neutral-600">{stats.total}</h3>
              <p className="text-neutral-500">Total Tasks</p>
            </div>
          </div>
        </Card>
        
        {/* Card 2 - In Progress Tasks */}
        <Card className="bg-white p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-warning bg-opacity-10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-neutral-600">{stats.inProgress}</h3>
              <p className="text-neutral-500">Tasks in Progress</p>
            </div>
          </div>
        </Card>
        
        {/* Card 3 - Completed Tasks */}
        <Card className="bg-white p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-success bg-opacity-10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-neutral-600">{stats.completed}</h3>
              <p className="text-neutral-500">Completed Tasks</p>
            </div>
          </div>
        </Card>
        
        {/* Card 4 - Overdue Tasks */}
        <Card className="bg-white p-5 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-danger bg-opacity-10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-neutral-600">{stats.overdue}</h3>
              <p className="text-neutral-500">Overdue Tasks</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
