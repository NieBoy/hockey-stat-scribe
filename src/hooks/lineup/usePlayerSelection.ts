
import { Lines, User, Position } from "@/types";
import { removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

export function usePlayerSelection(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const handlePlayerSelect = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    const newLines = { ...lines };
    let newAvailablePlayers = [...availablePlayers];
    
    if (playerId === 'none') {
      let playerToMove: User | null = null;
      
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW' && line.leftWing) {
          playerToMove = line.leftWing;
          line.leftWing = null;
        } else if (position === 'C' && line.center) {
          playerToMove = line.center;
          line.center = null;
        } else if (position === 'RW' && line.rightWing) {
          playerToMove = line.rightWing;
          line.rightWing = null;
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD' && line.leftDefense) {
          playerToMove = line.leftDefense;
          line.leftDefense = null;
        } else if (position === 'RD' && line.rightDefense) {
          playerToMove = line.rightDefense;
          line.rightDefense = null;
        }
      } else if (lineType === 'goalies') {
        const removedPlayer = newLines.goalies.find(g => g.id === playerId);
        newLines.goalies = newLines.goalies.filter(g => g.id !== playerId);
        if (removedPlayer) playerToMove = removedPlayer;
      }
      
      if (playerToMove) {
        newAvailablePlayers.push(playerToMove);
      }
    } else {
      const player = availablePlayers.find(p => p.id === playerId);
      if (!player) return;
      
      removePlayerFromCurrentPosition(playerId, newLines);
      
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW') {
          if (line.leftWing) newAvailablePlayers.push(line.leftWing);
          line.leftWing = { ...player, position: 'LW', lineNumber: lineIndex + 1 };
        } else if (position === 'C') {
          if (line.center) newAvailablePlayers.push(line.center);
          line.center = { ...player, position: 'C', lineNumber: lineIndex + 1 };
        } else if (position === 'RW') {
          if (line.rightWing) newAvailablePlayers.push(line.rightWing);
          line.rightWing = { ...player, position: 'RW', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD') {
          if (line.leftDefense) newAvailablePlayers.push(line.leftDefense);
          line.leftDefense = { ...player, position: 'LD', lineNumber: lineIndex + 1 };
        } else if (position === 'RD') {
          if (line.rightDefense) newAvailablePlayers.push(line.rightDefense);
          line.rightDefense = { ...player, position: 'RD', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'goalies') {
        newLines.goalies.push({ ...player, position: 'G' });
      }
      
      newAvailablePlayers = newAvailablePlayers.filter(p => p.id !== playerId);
    }
    
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
  };

  return {
    handlePlayerSelect
  };
}
