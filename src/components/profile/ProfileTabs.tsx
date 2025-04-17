
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSettings from "@/components/profile/UserSettings";
import TeamsList from "@/components/profile/TeamsList";
import PlayersList from "@/components/profile/PlayersList";
import RoleManager from "@/components/profile/RoleManager";
import { User, User as UserType } from "@/types";
import { Team } from "@/types";

interface ProfileTabsProps {
  user: UserType;
  teams: Team[];
  allPlayers: User[];
  isAdmin: boolean;
  isCoach: boolean;
  isParent: boolean;
  teamsLoading: boolean;
  teamsError: unknown;
  refetchTeams: () => Promise<any>;
}

export default function ProfileTabs({
  user,
  teams,
  allPlayers,
  isAdmin,
  isCoach,
  isParent,
  teamsLoading,
  teamsError,
  refetchTeams
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("settings");

  // Manually refresh data when the component mounts or tab changes
  useEffect(() => {
    const refreshData = async () => {
      console.log("Manual data refresh triggered");
      try {
        await refetchTeams();
      } catch (e) {
        console.error("Manual refresh error:", e);
      }
    };
    
    refreshData();
  }, [refetchTeams, activeTab]);

  return (
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
          <TeamsList teams={teams} isAdmin={isAdmin} />
        </TabsContent>
      )}
      {(isAdmin || isCoach || isParent) && (
        <TabsContent value="players" className="py-6">
          <PlayersList 
            players={allPlayers} 
            isParent={isParent} 
            isCoach={isCoach} 
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
