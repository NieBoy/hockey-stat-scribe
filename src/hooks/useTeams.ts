
import { Team } from "@/types";
import { useTeamDialog } from "./teams/useTeamDialog";
import { useTeamData } from "./teams/useTeamData";
import { useTeamPlayers } from "./teams/useTeamPlayers";

export function useTeams(initialTeamId?: string) {
  const {
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeamId,
    setSelectedTeamId,
    newPlayer,
    setNewPlayer,
    handleAddPlayerClick,
    resetPlayerForm
  } = useTeamDialog();

  const {
    teams,
    isLoadingTeams,
    teamsError,
    refetchTeams,
    team,
    isLoadingTeam,
    teamError,
    refetchTeam
  } = useTeamData(initialTeamId);

  const { handleAddPlayer, handleRemovePlayer } = useTeamPlayers(refetchTeams);

  const selectedTeam = selectedTeamId && teams
    ? teams.find(team => team.id === selectedTeamId)
    : team;

  const submitNewPlayer = async () => {
    if (!selectedTeam) return;
    
    const success = await handleAddPlayer(selectedTeam.id, newPlayer);
    
    if (success) {
      setAddPlayerDialogOpen(false);
      resetPlayerForm();
    }
  };

  return {
    // Team data
    teams,
    isLoading: isLoadingTeams,
    error: teamsError,
    refetch: refetchTeams,
    
    // Single team data
    team,
    isLoadingTeam,
    teamError,
    refetchTeam,

    // Dialog state
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeamId,
    selectedTeam,
    newPlayer,
    setNewPlayer,

    // Actions
    handleAddPlayer: handleAddPlayerClick,
    handleRemovePlayer,
    submitNewPlayer
  };
}
