
import { Lines, User, Position } from "@/types";
import { removePlayerFromCurrentPosition } from "@/utils/lineupUtils";
import { usePlayerManagement } from "./usePlayerManagement";

interface PlayerMoveParams {
  playerId: string;
  sourceType: 'forward' | 'defense' | 'goalie' | 'roster';
  sourceLineNumber: number;
  sourcePosition: Position | null;
  destType: 'forward' | 'defense' | 'goalie' | 'pp' | 'pk' | 'remove';
  destLineNumber: number;
  destPosition: Position | null;
}

export function usePlayerMovement(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const { updatePlayerPosition } = usePlayerManagement(lines, setLines, availablePlayers, setAvailablePlayers);

  const handlePlayerMove = ({
    playerId,
    sourceType,
    destType,
    destLineNumber,
    destPosition
  }: PlayerMoveParams) => {
    // Find the player
    let player: User | null = null;
    
    if (sourceType === 'roster') {
      const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
      if (playerIndex >= 0) {
        player = availablePlayers[playerIndex];
      }
    } else {
      removePlayerFromCurrentPosition(playerId, lines);
      player = availablePlayers.find(p => p.id === playerId) || null;
    }
    
    if (!player || destType === 'remove') {
      const newLines = { ...lines };
      removePlayerFromCurrentPosition(playerId, newLines);
      setLines(newLines);
      return;
    }

    // Update player position using shared logic
    if (destPosition && (destType === 'forward' || destType === 'defense' || destType === 'goalie')) {
      updatePlayerPosition({
        lineType: destType === 'forward' ? 'forwards' : destType === 'defense' ? 'defense' : 'goalies',
        lineIndex: destLineNumber - 1,
        position: destPosition,
        player
      });
    }
  };

  return {
    handlePlayerMove
  };
}
