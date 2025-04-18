
import { Lines, User, Position } from "@/types";
import { usePlayerManagement } from "./usePlayerManagement";
import { cloneDeep } from "lodash";

export function usePlayerSelection(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const { updatePlayerPosition } = usePlayerManagement(lines, setLines, availablePlayers, setAvailablePlayers);

  const handlePlayerSelect = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    console.log(`handlePlayerSelect called with: ${lineType}, ${lineIndex}, ${position}, ${playerId}`);
    
    try {
      const player = playerId === 'none' ? null : availablePlayers.find(p => p.id === playerId);
      
      // If trying to select a player that doesn't exist (might have been deleted or corrupted data)
      if (playerId !== 'none' && !player) {
        console.error(`Player with ID ${playerId} not found in available players list`);
        return;
      }
      
      updatePlayerPosition({
        lineType,
        lineIndex,
        position,
        player: player ? cloneDeep(player) : null
      });
    } catch (error) {
      console.error("Error in handlePlayerSelect:", error);
    }
  };

  return {
    handlePlayerSelect
  };
}
