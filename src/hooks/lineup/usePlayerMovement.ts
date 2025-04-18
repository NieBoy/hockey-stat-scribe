
import { Lines, User, Position } from "@/types";
import { removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

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
  const handlePlayerMove = ({
    playerId,
    sourceType,
    sourceLineNumber,
    sourcePosition,
    destType,
    destLineNumber,
    destPosition
  }: PlayerMoveParams) => {
    const newLines = JSON.parse(JSON.stringify(lines)) as Lines;
    let newAvailablePlayers = [...availablePlayers];
    
    // Find the player
    let player: User | null = null;
    
    if (sourceType === 'roster') {
      const playerIndex = newAvailablePlayers.findIndex(p => p.id === playerId);
      if (playerIndex >= 0) {
        player = newAvailablePlayers[playerIndex];
        if (destType !== 'remove') {
          newAvailablePlayers.splice(playerIndex, 1);
        }
      }
    } else {
      removePlayerFromCurrentPosition(playerId, newLines);
      player = availablePlayers.find(p => p.id === playerId) || null;
    }
    
    if (!player || destType === 'remove') {
      setAvailablePlayers(newAvailablePlayers);
      setLines(newLines);
      return;
    }

    // Add player to destination
    if (destType === 'forward' && destPosition) {
      const line = newLines.forwards[destLineNumber - 1];
      if (destPosition === 'LW') {
        if (line.leftWing) newAvailablePlayers.push(line.leftWing);
        line.leftWing = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'C') {
        if (line.center) newAvailablePlayers.push(line.center);
        line.center = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'RW') {
        if (line.rightWing) newAvailablePlayers.push(line.rightWing);
        line.rightWing = { ...player, position: destPosition, lineNumber: destLineNumber };
      }
    } 
    else if (destType === 'defense' && destPosition) {
      const line = newLines.defense[destLineNumber - 1];
      if (destPosition === 'LD') {
        if (line.leftDefense) newAvailablePlayers.push(line.leftDefense);
        line.leftDefense = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'RD') {
        if (line.rightDefense) newAvailablePlayers.push(line.rightDefense);
        line.rightDefense = { ...player, position: destPosition, lineNumber: destLineNumber };
      }
    }
    else if (destType === 'goalie') {
      newLines.goalies.push({ ...player, position: 'G' });
    }
    
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
  };

  return {
    handlePlayerMove
  };
}
