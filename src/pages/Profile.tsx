
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Users, 
  CalendarDays, 
  BarChart3, 
  Settings,
  Building,
  UserPlus 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { currentUser, mockTeams, mockOrganizations } from "@/lib/mock-data";
import { UserRole } from "@/types";
import TeamsList from "@/components/profile/TeamsList";
import OrganizationsList from "@/components/profile/OrganizationsList";
import PlayersList from "@/components/profile/PlayersList";
import UserSettings from "@/components/profile/UserSettings";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'coach':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'player':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'parent':
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getDefaultTab = () => {
    if (currentUser.isAdmin) return "organizations";
    if (currentUser.role.includes('coach')) return "teams";
    if (currentUser.role.includes('player')) return "stats";
    if (currentUser.role.includes('parent')) return "children";
    return "overview";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Profile Card */}
          <Card className="md:w-1/3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getUserInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{currentUser.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    {currentUser.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {currentUser.role.map((role, index) => (
                    <Badge key={index} variant="secondary" className={getRoleBadgeColor(role)}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                {currentUser.isAdmin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Organizations:</span>
                    <span className="font-medium">{currentUser.organizations?.length || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Teams:</span>
                  <span className="font-medium">{currentUser.teams?.length || 
                    (currentUser.role.includes('coach') ? 
                      mockTeams.filter(t => t.coaches.some(c => c.id === currentUser.id)).length : 0)
                  }</span>
                </div>
                {currentUser.role.includes('parent') && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Children:</span>
                    <span className="font-medium">{currentUser.children?.length || 0}</span>
                  </div>
                )}
              </div>

              {currentUser.isAdmin && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/invite">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Users
                      </Link>
                    </Button>
                    {currentUser.organizations && currentUser.organizations.length > 0 && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/organizations/manage">
                          <Building className="mr-2 h-4 w-4" />
                          Manage Organizations
                        </Link>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="flex-1">
            <Tabs defaultValue={getDefaultTab()} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {currentUser.isAdmin && (
                  <TabsTrigger value="organizations">
                    Organizations
                  </TabsTrigger>
                )}
                {(currentUser.role.includes('coach') || currentUser.isAdmin) && (
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                )}
                {currentUser.role.includes('parent') && (
                  <TabsTrigger value="children">Children</TabsTrigger>
                )}
                {currentUser.role.includes('player') && (
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                )}
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>
                      View your profile information and recent activity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          Upcoming Games
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          You have {currentUser.role.includes('coach') ? 2 : 1} upcoming games this week.
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Recent Activity
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          Last login: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {currentUser.isAdmin && (
                <TabsContent value="organizations" className="space-y-4">
                  <OrganizationsList 
                    organizations={currentUser.organizations || []} 
                    isAdmin={true}
                  />
                </TabsContent>
              )}

              {(currentUser.role.includes('coach') || currentUser.isAdmin) && (
                <TabsContent value="teams" className="space-y-4">
                  <TeamsList 
                    teams={currentUser.role.includes('coach') ? 
                      mockTeams.filter(t => t.coaches.some(c => c.id === currentUser.id)) : 
                      mockTeams} 
                    isAdmin={currentUser.isAdmin || false}
                  />
                </TabsContent>
              )}

              {currentUser.role.includes('parent') && (
                <TabsContent value="children" className="space-y-4">
                  <PlayersList 
                    players={currentUser.children || []}
                    isParent={true}
                  />
                </TabsContent>
              )}

              {currentUser.role.includes('player') && (
                <TabsContent value="stats" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Stats</CardTitle>
                      <CardDescription>
                        View your performance statistics from all games.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Your personal statistics will be displayed here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="settings" className="space-y-4">
                <UserSettings user={currentUser} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
