import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, User, UserPlus, RefreshCw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserDialog } from "@/components/dialogs/user-dialog";
import { UserRoleDialog } from "@/components/dialogs/user-role-dialog";
import { TeamDialog } from "@/components/dialogs/team-dialog";
import { FilterDialog } from "@/components/dialogs/filter-dialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Filter users based on search query
  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const columns = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }: { row: { original: any } }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: { row: { original: any } }) => {
        const user = row.original;
        return (
          <Badge variant={
            user.role === "admin" ? "destructive" : 
            user.role === "manager" ? "default" : 
            "secondary"
          }>
            {user.role || "member"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: { original: any } }) => {
        return row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "N/A";
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: any } }) => {
        const user = row.original;
        return (
          <div className="flex justify-end gap-2">
            <UserRoleDialog
              userId={user.id}
              currentRole={user.role || "member"}
              trigger={
                <Button variant="ghost" size="sm">
                  Change Role
                </Button>
              }
            />
            <UserDialog
              mode="edit"
              userId={user.id}
              trigger={
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              }
            />
            <ConfirmDeleteDialog
              resourceType="user"
              resourceId={user.id}
              resourceName={user.username}
              userId={1} // Current admin user ID
              queryKeysToInvalidate={["/api/users"]}
              trigger={
                <Button variant="ghost" size="sm" className="text-destructive">
                  Delete
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];

  return (
    <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-neutral-100">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-600">Administration</h1>
              <p className="mt-1 text-neutral-500">Manage users, roles, and system settings</p>
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
        </Tabs>

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
                resourceType="user"
                statusOptions={[
                  { label: "Admin", value: "admin" },
                  { label: "Manager", value: "manager" },
                  { label: "Member", value: "member" }
                ]}
                onApplyFilters={(filters) => {
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
                resourceType="user"
                statusOptions={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" }
                ]}
                onApplyFilters={(filters) => {
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
      </div>
    </main>
  );
}