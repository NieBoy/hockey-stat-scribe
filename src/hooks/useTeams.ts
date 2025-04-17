
import { Team } from "@/types";
import { useTeamDialog } from "./teams/useTeamDialog";
import { useTeamData } from "./teams/useTeamData";
import { useTeamPlayers } from "./teams/useTeamPlayers";
import { toast } from "sonner";

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

  const selectedTeam = selectedTeamId && (teams as Team[])
    ? (teams as Team[]).find(team => team.id === selectedTeamId)
    : team;

  const submitNewPlayer = async () => {
    if (!selectedTeam) {
      console.error("No team selected");
      return;
    }
    
    // Validate required fields
    if (!newPlayer.name.trim()) {
      toast.error("Player name is required");
      return;
    }
    
    if (!newPlayer.number.trim()) {
      toast.error("Player number is required");
      return;
    }
    
    try {
      const success = await handleAddPlayer(selectedTeam.id, newPlayer);
      
      if (success) {
        setAddPlayerDialogOpen(false);
        resetPlayerForm();
        await refetchTeam(); // Also refresh single team data if on team detail page
      }
    } catch (error) {
      console.error("Error submitting player:", error);
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
