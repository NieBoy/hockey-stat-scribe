
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayersTabContent from "./PlayersTabContent";
import CoachesTabContent from "./CoachesTabContent";
import StatsTabContent from "./StatsTabContent";
import TeamMembersTable from "./TeamMembersTable";
import { Team } from "@/types";

interface TeamTabsProps {
  team: Team;
  activeTab: string;
  setActiveTab: (value: string) => void;
  handleAddPlayer: (teamId: string) => void;
  handleRemovePlayer: (teamId: string, playerId: string, playerName: string) => void;
  handleTeamUpdate: () => void;
  handleSendInvitations: (memberIds: string[]) => void;
  handleRemoveMember: (member: any) => void;
}

export default function TeamTabs({
  team,
  activeTab,
  setActiveTab,
  handleAddPlayer,
  handleRemovePlayer,
  handleTeamUpdate,
  handleSendInvitations,
  handleRemoveMember
}: TeamTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
        <TabsTrigger value="players">Players</TabsTrigger>
        <TabsTrigger value="coaches">Coaches</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="all-members">All Members</TabsTrigger>
      </TabsList>
      
      <TabsContent value="players" className="space-y-4">
        <PlayersTabContent 
          team={team} 
          handleAddPlayer={handleAddPlayer} 
          handleRemovePlayer={handleRemovePlayer} 
        />
      </TabsContent>
      
      <TabsContent value="coaches" className="space-y-4">
        <CoachesTabContent 
          team={team} 
          onCoachAdded={handleTeamUpdate} 
        />
      </TabsContent>
      
      <TabsContent value="stats" className="space-y-4">
        <StatsTabContent team={team} />
      </TabsContent>
      
      <TabsContent value="all-members" className="space-y-4">
        <TeamMembersTable 
          team={team}
          onSendInvitations={handleSendInvitations}
          onRemoveMember={handleRemoveMember}
        />
      </TabsContent>
    </Tabs>
  );
}
