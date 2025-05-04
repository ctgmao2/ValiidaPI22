import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { Link } from "wouter";
import { ColumnDef } from "@tanstack/react-table";
import { 
  AlertTriangle, Plus, Filter, Search, Users, 
  RefreshCw, UserPlus, Trash2, Edit, MoreHorizontal, 
  Mail, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { UserDialog } from "@/components/dialogs/user-dialog";
import { TeamDialog } from "@/components/dialogs/team-dialog";
import { UserRoleDialog } from "@/components/dialogs/user-role-dialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { FilterDialog } from "@/components/dialogs/filter-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.username}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge
            variant={
              role === "admin" ? "default" : 
              role === "manager" ? "secondary" : 
              "outline"
            }
          >
            {role || "user"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === "active" ? "default" : 
              status === "inactive" ? "secondary" : 
              "destructive"
            }
          >
            {status || "inactive"}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <UserDialog 
                    mode="edit" 
                    userId={user.id}
                    trigger={
                      <div className="flex items-center cursor-pointer w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </div>
                    }
                  />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <UserRoleDialog 
                    userId={user.id}
                    username={user.username}
                    currentRole={user.role}
                    trigger={
                      <div className="flex items-center cursor-pointer w-full">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Change Role</span>
                      </div>
                    }
                  />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <ConfirmDeleteDialog
                    resourceType="user"
                    resourceId={user.id}
                    resourceName={user.username}
                    queryKeysToInvalidate={['/api/users']}
                    trigger={
                      <div className="flex items-center cursor-pointer w-full text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </div>
                    }
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    return (
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Administration</h1>
              <p className="mt-1 text-neutral-500">Manage users, teams, and system settings</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline">
                <AlertTriangle className="-ml-1 mr-2 h-5 w-5" />
                System Logs
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              <span>Teams</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="users" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-1 items-center max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="ml-2" onClick={() => setSearchQuery("")}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <FilterDialog
                  filterType="users"
                  onFilter={(filters) => {
                    console.log("Applied filters:", filters);
                    // In a real implementation, we would:
                    // 1. Store the filters in state
                    // 2. Apply them to filter the users data
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  }
                />
                <UserDialog
                  mode="create"
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading users...</p>
                    </div>
                  </div>
                ) : (
                  <DataTable 
                    columns={columns} 
                    data={filteredUsers} 
                    emptyMessage="No users found" 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-1 items-center max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search teams..."
                    className="pl-8 bg-white"
                  />
                </div>
                <Button variant="outline" size="icon" className="ml-2">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <FilterDialog
                  filterType="projects"
                  onFilter={(filters) => {
                    console.log("Applied filters:", filters);
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  }
                />
                <TeamDialog
                  mode="create"
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            <Card className="min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center p-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Team Management</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Create and manage teams to organize your users and their permissions. 
                  Teams can have specific access levels to projects and resources.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Team
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}