
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team, User } from "@/types";
import PlayersTabContent from "./PlayersTabContent";
import CoachesTabContent from "./CoachesTabContent";
import StatsTabContent from "./StatsTabContent";
import TeamMembersTable from "./TeamMembersTable";

interface TeamTabsProps {
  team: Team;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAddPlayer: () => void;
  handleRemovePlayer: (playerId: string) => void;
  handleTeamUpdate: () => void;
  handleSendInvitations: (memberIds: string[]) => void;
  handleRemoveMember: (member: User) => void;
  isSendingInvitations?: boolean;
  lastInvitationSent?: Date | null;
  invitationLinks?: string[];
}

const TeamTabs = ({
  team,
  activeTab,
  setActiveTab,
  handleAddPlayer,
  handleRemovePlayer,
  handleTeamUpdate,
  handleSendInvitations,
  handleRemoveMember,
  isSendingInvitations,
  lastInvitationSent,
  invitationLinks
}: TeamTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="players">Players</TabsTrigger>
        <TabsTrigger value="coaches">Coaches</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="players" className="mt-6">
        <PlayersTabContent
          team={team}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={(teamId, playerId, playerName) => handleRemovePlayer(playerId)}
        />
      </TabsContent>
      
      <TabsContent value="coaches" className="mt-6">
        <CoachesTabContent 
          team={team}
          onCoachAdded={handleTeamUpdate} 
        />
      </TabsContent>
      
      <TabsContent value="members" className="mt-6">
        <TeamMembersTable
          team={team}
          onSendInvitations={handleSendInvitations}
          onRemoveMember={handleRemoveMember}
          isSendingInvitations={isSendingInvitations}
          lastInvitationSent={lastInvitationSent}
          invitationLinks={invitationLinks}
        />
      </TabsContent>
      
      <TabsContent value="stats" className="mt-6">
        <StatsTabContent team={team} />
      </TabsContent>
    </Tabs>
  );
};

export default TeamTabs;
