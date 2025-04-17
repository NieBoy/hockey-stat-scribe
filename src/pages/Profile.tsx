
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import UserSettings from "@/components/profile/UserSettings";
import TeamsList from "@/components/profile/TeamsList";
import PlayersList from "@/components/profile/PlayersList";
import RoleManager from "@/components/profile/RoleManager";
import { useQuery } from "@tanstack/react-query";
import { getTeams } from "@/services/teams";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("settings");

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    enabled: !!user,
    // Force refetch when the component mounts
    refetchOnMount: true,
    // Refresh teams data when this component is active
    refetchInterval: activeTab === "teams" ? 10000 : false
  });

  useEffect(() => {
    console.log("Profile loaded with user:", user);
    console.log("Teams loaded:", teams);
    
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
    }
  }, [user, teams, teamsError]);

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const isAdmin = user.role.includes('admin');
  const isCoach = user.role.includes('coach');
  const isPlayer = user.role.includes('player');
  const isParent = user.role.includes('parent');

  // Get teams for the current user
  const userTeams = teams.filter(team => {
    console.log("Filtering team:", team.id, team.name);
    console.log("Team coaches:", team.coaches.map(c => c.id));
    
    // Admin can see all teams
    if (isAdmin) return true;
    
    // Coach can see teams they coach
    if (isCoach) {
      const isCoaching = team.coaches.some(coach => coach.id === user.id);
      console.log("Is coaching this team:", isCoaching, "user.id:", user.id);
      return isCoaching;
    }
    
    // Player can see teams they play in
    if (isPlayer) {
      const isPlaying = team.players.some(player => player.id === user.id);
      console.log("Is player in this team:", isPlaying);
      return isPlaying;
    }
    
    // Parent can see teams their children play in
    if (isParent) {
      const isParentInTeam = team.parents.some(parent => parent.id === user.id);
      console.log("Is parent in this team:", isParentInTeam);
      return isParentInTeam;
    }
    
    return false;
  });

  console.log("Filtered user teams:", userTeams);

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

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            {(isAdmin || isCoach) && <TabsTrigger value="teams">Teams</TabsTrigger>}
            {(isAdmin || isCoach || isParent) && <TabsTrigger value="players">Players</TabsTrigger>}
          </TabsList>
          <TabsContent value="settings" className="py-6">
            <UserSettings user={user} />
          </TabsContent>
          <TabsContent value="roles" className="py-6">
            <RoleManager />
          </TabsContent>
          {(isAdmin || isCoach) && (
            <TabsContent value="teams" className="py-6">
              <TeamsList teams={userTeams} isAdmin={isAdmin} />
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
