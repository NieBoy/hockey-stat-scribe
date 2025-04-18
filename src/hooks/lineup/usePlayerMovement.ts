
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
      // Find player in available players
      player = availablePlayers.find(p => p.id === playerId) || null;
    } else {
      // Create a copy of the lines object to safely modify it
      const newLines = { ...lines };
      
      // Before removing the player, find them in the current lineup
      // Check forwards
      for (const line of lines.forwards) {
        if (line.leftWing?.id === playerId) {
          player = line.leftWing;
        } else if (line.center?.id === playerId) {
          player = line.center;
        } else if (line.rightWing?.id === playerId) {
          player = line.rightWing;
        }
        if (player) break;
      }
      
      // Check defense
      if (!player) {
        for (const line of lines.defense) {
          if (line.leftDefense?.id === playerId) {
            player = line.leftDefense;
          } else if (line.rightDefense?.id === playerId) {
            player = line.rightDefense;
          }
          if (player) break;
        }
      }
      
      // Check goalies
      if (!player) {
        player = lines.goalies.find(g => g.id === playerId) || null;
      }
      
      // Now remove the player from their current position
      removePlayerFromCurrentPosition(playerId, newLines);
      setLines(newLines);
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
