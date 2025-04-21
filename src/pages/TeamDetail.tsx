
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import TeamHeader from "@/components/teams/TeamHeader";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import TeamTabs from "@/components/teams/TeamTabs";
import QuickLineupSection from "@/components/teams/QuickLineupSection";
import TeamDetailLoading from "@/components/teams/TeamDetailLoading";
import TeamDetailError from "@/components/teams/TeamDetailError";
import TeamDetailNotFound from "@/components/teams/TeamDetailNotFound";
import { useTeamData } from "@/hooks/useTeamData";
import RequireAuth from "@/components/auth/RequireAuth";

// Create query client outside component to avoid recreation on each render
const queryClient = new QueryClient();

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <RequireAuth>
        <TeamDetailContent id={id} navigate={navigate} />
      </RequireAuth>
    </QueryClientProvider>
  );
}

// Separate content component that can use React Query hooks
function TeamDetailContent({ id, navigate }: { id: string, navigate: ReturnType<typeof useNavigate> }) {
  const {
    activeTab,
    setActiveTab,
    lineupRefreshKey,
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
    handleSendInvitations,
    handleRemoveMember,
    handleTeamUpdate,
    handleRefreshLineup,
    isSendingInvitations,
    lastInvitationSent
  } = useTeamData(id);

  const handleEditLineupClick = () => {
    console.log("TeamDetail - Navigating to lineup editor page");
    navigate(`/teams/${id}/lineup`);
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

  // Fixed function to properly handle team invitations
  const handleTeamInvitations = (memberIds: string[]) => {
    if (id) {
      handleSendInvitations(memberIds);
    }
  };

  // Fixed function to properly handle player removals with correct parameters
  const handlePlayerRemoval = (playerId: string) => {
    if (id && playerId) {
      handleRemovePlayer(id, playerId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <TeamHeader 
          team={team}
          onBackClick={() => navigate("/teams")}
          onAddPlayerClick={() => handleAddPlayer()}
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
          handleRemovePlayer={handlePlayerRemoval}
          handleTeamUpdate={handleTeamUpdate}
          handleSendInvitations={handleTeamInvitations}
          handleRemoveMember={handleRemoveMember}
          isSendingInvitations={isSendingInvitations}
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
    </MainLayout>
  );
}
