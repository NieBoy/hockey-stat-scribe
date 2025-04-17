
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="py-6">
            <UserSettings user={user} />
          </TabsContent>
          <TabsContent value="roles" className="py-6">
            <RoleManager />
          </TabsContent>
          <TabsContent value="teams" className="py-6">
            <TeamsList teams={user.teams || []} />
          </TabsContent>
          <TabsContent value="players" className="py-6">
            <PlayersList players={[]} />
          </TabsContent>
          {user.isAdmin && (
            <TabsContent value="organizations" className="py-6">
              <OrganizationsList organizations={[]} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
