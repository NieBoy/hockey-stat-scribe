
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import UserSettings from "@/components/profile/UserSettings";
import TeamsList from "@/components/profile/TeamsList";
import OrganizationsList from "@/components/profile/OrganizationsList";
import PlayersList from "@/components/profile/PlayersList";
import RoleManager from "@/components/profile/RoleManager";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const isAdmin = user.role.includes('admin');
  const isCoach = user.role.includes('coach');
  const isPlayer = user.role.includes('player');
  const isParent = user.role.includes('parent');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}'s Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and view your teams and stats
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            {(isAdmin || isCoach) && <TabsTrigger value="teams">Teams</TabsTrigger>}
            {(isAdmin || isCoach || isParent) && <TabsTrigger value="players">Players</TabsTrigger>}
            {isAdmin && <TabsTrigger value="organizations">Organizations</TabsTrigger>}
          </TabsList>
          <TabsContent value="settings" className="py-6">
            <UserSettings user={user} />
          </TabsContent>
          <TabsContent value="roles" className="py-6">
            <RoleManager />
          </TabsContent>
          {(isAdmin || isCoach) && (
            <TabsContent value="teams" className="py-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Teams</h2>
                <Button asChild>
                  <Link to="/teams/new">
                    <Plus className="mr-2 h-4 w-4" /> Add Team
                  </Link>
                </Button>
              </div>
              <TeamsList teams={user.teams || []} />
              <div className="mt-6 flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/teams">View All Teams</Link>
                </Button>
              </div>
            </TabsContent>
          )}
          {(isAdmin || isCoach || isParent) && (
            <TabsContent value="players" className="py-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Players</h2>
                {(isAdmin || isCoach) && (
                  <Button asChild>
                    <Link to="/teams">
                      <Plus className="mr-2 h-4 w-4" /> Add Player to Team
                    </Link>
                  </Button>
                )}
              </div>
              <PlayersList players={[]} />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="organizations" className="py-6">
              <OrganizationsList 
                organizations={[]} 
                isAdmin={true}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
