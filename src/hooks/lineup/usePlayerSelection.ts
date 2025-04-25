
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
      // Handle special case for clearing a position
      if (playerId === 'none') {
        updatePlayerPosition({
          lineType,
          lineIndex,
          position,
          player: null
        });
        return;
      }
      
      // Find player in available players or in the current position
      let player: User | null = null;
      
      // First check available players
      player = availablePlayers.find(p => p.id === playerId) || null;
      
      // If not found in available, check if it's the current player
      if (!player) {
        if (lineType === 'forwards') {
          const line = lines.forwards[lineIndex];
          if (line) {
            if (position === 'LW' && line.leftWing?.id === playerId) player = line.leftWing;
            else if (position === 'C' && line.center?.id === playerId) player = line.center;
            else if (position === 'RW' && line.rightWing?.id === playerId) player = line.rightWing;
          }
        } else if (lineType === 'defense') {
          const line = lines.defense[lineIndex];
          if (line) {
            if (position === 'LD' && line.leftDefense?.id === playerId) player = line.leftDefense;
            else if (position === 'RD' && line.rightDefense?.id === playerId) player = line.rightDefense;
          }
        } else if (lineType === 'goalies' && position === 'G') {
          player = lines.goalies.find(g => g.id === playerId) || null;
        }
      }
      
      // If we didn't find the player anywhere, log error and return
      if (!player) {
        console.error(`Player with ID ${playerId} not found in available players list or current lineup`);
        return;
      }
      
      updatePlayerPosition({
        lineType,
        lineIndex,
        position,
        player: cloneDeep(player)
      });
    } catch (error) {
      console.error("Error in handlePlayerSelect:", error);
    }
  };

  return {
    handlePlayerSelect
  };
}
