import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import { useTeams } from "@/hooks/useTeams";
import TeamHeader from "@/components/teams/TeamHeader";
import PlayersTabContent from "@/components/teams/PlayersTabContent";
import CoachesTabContent from "@/components/teams/CoachesTabContent";
import StatsTabContent from "@/components/teams/StatsTabContent";
import TeamMembersTable from "@/components/teams/TeamMembersTable";
import { sendTeamInvitations } from "@/services/teams";
import { deleteTeamMember } from "@/services/teams";
import { toast } from "sonner";
import { User } from "@/types";

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  
  const { 
    addPlayerDialogOpen, 
    setAddPlayerDialogOpen, 
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer,
    selectedTeam,
    handleRemovePlayer,
    team,
    isLoadingTeam,
    teamError,
    refetchTeam
  } = useTeams(id);
  
  const handleSendInvitations = async (memberIds: string[]) => {
    try {
      if (!team) return;
      await sendTeamInvitations(team.id, memberIds);
      toast.success(`Invitations sent to ${memberIds.length} team members`);
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Failed to send invitations");
    }
  };

  const handleRemoveMember = async (member: User) => {
    try {
      if (!team) return;
      
      const success = await deleteTeamMember(member.id);
      if (success) {
        toast.success(`${member.name} has been removed from the team`);
        refetchTeam();
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  if (isLoadingTeam) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (teamError) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Error Loading Team</h1>
          <p className="text-red-500">{(teamError as Error).message}</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }
  
  const handleTeamUpdate = () => {
    refetchTeam();
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <TeamHeader 
          team={team}
          onBackClick={() => navigate("/teams")}
          onAddPlayerClick={handleAddPlayer}
        />

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
            <StatsTabContent />
          </TabsContent>
          
          <TabsContent value="all-members" className="space-y-4">
            <TeamMembersTable 
              team={team}
              onSendInvitations={handleSendInvitations}
              onRemoveMember={handleRemoveMember}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddPlayerDialog
        isOpen={addPlayerDialogOpen}
        onOpenChange={setAddPlayerDialogOpen}
        selectedTeam={selectedTeam}
        onSubmit={submitNewPlayer}
        newPlayer={newPlayer}
        setNewPlayer={setNewPlayer}
      />
    </MainLayout>
  );
}
