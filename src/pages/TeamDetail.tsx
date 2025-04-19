
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

const queryClient = new QueryClient();

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
    handleRefreshLineup
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
