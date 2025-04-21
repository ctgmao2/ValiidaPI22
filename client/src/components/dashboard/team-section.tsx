import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { MessageSquare, Plus, UserPlus } from "lucide-react";

interface TeamSectionProps {
  users: User[];
}

export default function TeamSection({ users }: TeamSectionProps) {
  return (
    <Card className="p-6 border border-neutral-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-neutral-600">Project Team</h3>
        <button className="text-sm font-medium text-primary hover:text-primary-dark">Manage Team</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback bgColor={user.avatarColor}>
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600">{user.fullName}</p>
              <p className="text-xs text-neutral-500">{user.role}</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <div className="flex space-x-1">
                <button className="text-neutral-400 hover:text-primary p-1" title="Message">
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button className="text-neutral-400 hover:text-primary p-1" title="Assign Task">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button variant="outline" className="px-4 py-2">
          <UserPlus className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
          Add Team Member
        </Button>
      </div>
    </Card>
  );
}
