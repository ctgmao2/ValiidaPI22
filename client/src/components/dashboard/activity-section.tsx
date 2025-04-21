import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, MessageSquare, Clock, Plus } from "lucide-react";
import { ActivityWithDetails } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ActivitySectionProps {
  activities: ActivityWithDetails[];
}

export default function ActivitySection({ activities }: ActivitySectionProps) {
  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task-completed':
        return <Check className="h-5 w-5" />;
      case 'comment-added':
        return <MessageSquare className="h-5 w-5" />;
      case 'task-updated':
        return <Clock className="h-5 w-5" />;
      case 'task-created':
        return <Plus className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  // Get background color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task-completed':
        return 'bg-success';
      case 'comment-added':
        return 'bg-primary';
      case 'task-updated':
        return 'bg-warning';
      case 'task-created':
        return 'bg-primary';
      default:
        return 'bg-neutral-400';
    }
  };
  
  return (
    <div className="lg:col-span-1">
      <Card className="p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-600 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${getActivityColor(activity.type)} text-white flex items-center justify-center ring-8 ring-white`}>
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-neutral-600">
                          <span className="font-medium text-primary">{activity.user?.fullName}</span> {activity.description}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-neutral-500">
                        <time>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">View all activity</a>
        </div>
      </Card>
    </div>
  );
}
