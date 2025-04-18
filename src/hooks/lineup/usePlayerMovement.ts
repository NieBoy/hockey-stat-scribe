
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
    sourceLineNumber,
    sourcePosition,
    destType,
    destLineNumber,
    destPosition
  }: PlayerMoveParams) => {
    console.log("Handle player move:", {
      playerId,
      sourceType,
      sourceLineNumber,
      sourcePosition,
      destType,
      destLineNumber,
      destPosition
    });
    
    // Find the player
    let player: User | null = null;
    
    if (sourceType === 'roster') {
      // Find player in available players
      player = availablePlayers.find(p => p.id === playerId) || null;
      console.log("Found player in available players:", player);
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

      console.log("Found player in lines:", player);
      
      // Now remove the player from their current position
      removePlayerFromCurrentPosition(playerId, newLines);
      setLines(newLines);
    }
    
    if (!player) {
      console.error("Player not found:", playerId);
      return;
    }

    if (destType === 'remove') {
      console.log("Removing player from lineup");
      const newLines = { ...lines };
      removePlayerFromCurrentPosition(playerId, newLines);
      setLines(newLines);
      
      // Add player back to available players if not already there
      if (!availablePlayers.some(p => p.id === playerId)) {
        setAvailablePlayers([...availablePlayers, player]);
      }
      return;
    }

    // Update player position using shared logic
    if (destPosition) {
      console.log("Updating player position:", {
        lineType: destType === 'forward' ? 'forwards' : destType === 'defense' ? 'defense' : 'goalies',
        lineIndex: destLineNumber - 1,
        position: destPosition,
      });

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
