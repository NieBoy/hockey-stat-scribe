
import { Team, Lines } from "@/types";
import { useLineupData } from "./lineup/useLineupData";
import { useAvailablePlayers } from "./lineup/useAvailablePlayers";
import { useLineManagement } from "./lineup/useLineManagement";
import { usePlayerMovement } from "./lineup/usePlayerMovement";
import { usePlayerSelection } from "./lineup/usePlayerSelection";

export function useLineupEditor(team: Team) {
  console.log("useLineupEditor initializing with team:", team?.id);
  
  const {
    lines,
    setLines,
    loadingState,
    error,
    lastRefreshed,
    hasPositionData,
    refreshLineup,
    lineupData
  } = useLineupData(team);

  const { 
    availablePlayers, 
    setAvailablePlayers, 
    updateAvailablePlayers 
  } = useAvailablePlayers(team, lines);
  
  const { 
    addForwardLine, 
    addDefenseLine, 
    deleteForwardLine, 
    deleteDefenseLine 
  } = useLineManagement(lines, setLines);
  
  const { handlePlayerMove } = usePlayerMovement(
    lines, 
    setLines, 
    availablePlayers, 
    setAvailablePlayers
  );
  
  const { handlePlayerSelect } = usePlayerSelection(
    lines, 
    setLines, 
    availablePlayers, 
    setAvailablePlayers
  );

  return {
    lines,
    setLines,
    availablePlayers,
    setAvailablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    deleteForwardLine,
    deleteDefenseLine,
    handlePlayerMove,
    isInitialLoadComplete: loadingState === 'success',
    isLoading: loadingState === 'loading',
    error,
    refreshLineupData: refreshLineup,
    lineupData
  };
}
