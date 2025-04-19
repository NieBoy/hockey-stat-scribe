
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import { useTeams } from "@/hooks/useTeams";
import TeamHeader from "@/components/teams/TeamHeader";
import { toast } from "sonner";
import { User } from "@/types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import TeamTabs from "@/components/teams/TeamTabs";
import QuickLineupSection from "@/components/teams/QuickLineupSection";
import { sendInvitationsToTeamMembers, deleteTeamMember } from "@/services/teams";
import TeamDetailLoading from "@/components/teams/TeamDetailLoading";
import TeamDetailError from "@/components/teams/TeamDetailError";
import TeamDetailNotFound from "@/components/teams/TeamDetailNotFound";

const queryClient = new QueryClient();

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  const [lineupRefreshKey, setLineupRefreshKey] = useState<number>(0);
  
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

  useEffect(() => {
    console.log("TeamDetail - Initial refresh of team data");
    refetchTeam();

    const intervalId = setInterval(() => {
      console.log("TeamDetail - Periodic team data refresh");
      refetchTeam();
      setLineupRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refetchTeam]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("TeamDetail - Window focused - refreshing team data");
      refetchTeam();
      setLineupRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchTeam]);

  useEffect(() => {
    console.log("TeamDetail - Component mounted, forcing immediate lineup refresh");
    setLineupRefreshKey(Date.now());
  }, []);

  const handleSendInvitations = async (memberIds: string[]) => {
    if (!id || memberIds.length === 0) {
      toast.error("No members selected for invitation");
      return;
    }
    
    try {
      console.log(`TeamDetail - Sending invitations to ${memberIds.length} members`);
      const success = await sendInvitationsToTeamMembers(id, memberIds);
      
      if (success) {
        toast.success(`Invitations sent to ${memberIds.length} team members`);
      } else {
        toast.error("Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Error sending invitations");
    }
  };

  const handleRemoveMember = async (member: User) => {
    if (!member?.id) {
      toast.error("Invalid member selected");
      return;
    }
    
    try {
      console.log(`TeamDetail - Removing team member: ${member.name} (${member.id})`);
      const success = await deleteTeamMember(member.id);
      
      if (success) {
        toast.success(`${member.name} has been removed from the team`);
        refetchTeam();
      } else {
        toast.error("Failed to remove team member");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Error removing team member");
    }
  };

  const handleTeamUpdate = () => {
    console.log("Team update detected, refreshing data");
    refetchTeam();
    setLineupRefreshKey(prev => prev + 1);
  };

  const handleEditLineupClick = () => {
    console.log("TeamDetail - Navigating to lineup editor page");
    navigate(`/teams/${id}/lineup`);
  };

  const handleRefreshLineup = () => {
    console.log("TeamDetail - Manual lineup refresh requested");
    refetchTeam();
    setLineupRefreshKey(Date.now());
    toast.success("Refreshing lineup data...");
  };

  if (isLoadingTeam) {
    return <TeamDetailLoading />;
  }

  if (teamError) {
    return <TeamDetailError error={teamError as Error} />;
  }

  if (!team) {
    return <TeamDetailNotFound />;
  }

  return (
    <MainLayout>
      <QueryClientProvider client={queryClient}>
        <div className="space-y-6">
          <TeamHeader 
            team={team}
            onBackClick={() => navigate("/teams")}
            onAddPlayerClick={handleAddPlayer}
          />

          <QuickLineupSection 
            team={team}
            lineupRefreshKey={lineupRefreshKey}
            onEditLineup={handleEditLineupClick}
            onRefreshLineup={handleRefreshLineup}
          />

          <TeamTabs 
            team={team}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleAddPlayer={handleAddPlayer}
            handleRemovePlayer={handleRemovePlayer}
            handleTeamUpdate={handleTeamUpdate}
            handleSendInvitations={handleSendInvitations}
            handleRemoveMember={handleRemoveMember}
          />
        </div>

        <AddPlayerDialog
          isOpen={addPlayerDialogOpen}
          onOpenChange={setAddPlayerDialogOpen}
          selectedTeam={selectedTeam}
          onSubmit={submitNewPlayer}
          newPlayer={newPlayer}
          setNewPlayer={setNewPlayer}
        />
      </QueryClientProvider>
    </MainLayout>
  );
}
