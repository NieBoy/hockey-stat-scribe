
import { Lines, User, Position } from "@/types";
import { usePlayerManagement } from "./usePlayerManagement";

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
    const player = playerId === 'none' ? null : availablePlayers.find(p => p.id === playerId);
    
    updatePlayerPosition({
      lineType,
      lineIndex,
      position,
      player
    });
  };

  return {
    handlePlayerSelect
  };
}
