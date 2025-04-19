import { useState, useEffect } from "react";
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
import { QuickLineupView } from "@/components/teams/QuickLineupView";
import { sendInvitationsToTeamMembers, deleteTeamMember } from "@/services/teams";
import { toast } from "sonner";
import { User } from "@/types";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

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

  // Add the missing function handlers here
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

  return (
    <MainLayout>
      <QueryClientProvider client={queryClient}>
        <div className="space-y-6">
          <TeamHeader 
            team={team}
            onBackClick={() => navigate("/teams")}
            onAddPlayerClick={handleAddPlayer}
          />

          <QuickLineupView key={`lineup-${lineupRefreshKey}`} team={team} />

          <div className="flex justify-between items-center mb-2">
            <Button variant="outline" onClick={handleRefreshLineup}>
              Refresh Lineup
            </Button>
            <Button onClick={handleEditLineupClick}>
              Edit Lineup
            </Button>
          </div>

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
