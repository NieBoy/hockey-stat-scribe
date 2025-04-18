
import { Lines, User, Position } from "@/types";

interface PlayerUpdateConfig {
  lineType: 'forwards' | 'defense' | 'goalies';
  lineIndex: number;
  position: Position;
  player: User | null;
}

export function usePlayerManagement(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const updatePlayerPosition = ({
    lineType,
    lineIndex,
    position,
    player
  }: PlayerUpdateConfig) => {
    const newLines = { ...lines };
    let newAvailablePlayers = [...availablePlayers];
    
    // Handle removing existing player from position
    if (lineType === 'forwards') {
      const line = newLines.forwards[lineIndex];
      if (position === 'LW' && line.leftWing) {
        newAvailablePlayers.push(line.leftWing);
        line.leftWing = null;
      } else if (position === 'C' && line.center) {
        newAvailablePlayers.push(line.center);
        line.center = null;
      } else if (position === 'RW' && line.rightWing) {
        newAvailablePlayers.push(line.rightWing);
        line.rightWing = null;
      }
    } else if (lineType === 'defense') {
      const line = newLines.defense[lineIndex];
      if (position === 'LD' && line.leftDefense) {
        newAvailablePlayers.push(line.leftDefense);
        line.leftDefense = null;
      } else if (position === 'RD' && line.rightDefense) {
        newAvailablePlayers.push(line.rightDefense);
        line.rightDefense = null;
      }
    }
    
    // Add new player to position if provided
    if (player) {
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW') {
          line.leftWing = { ...player, position: 'LW', lineNumber: lineIndex + 1 };
        } else if (position === 'C') {
          line.center = { ...player, position: 'C', lineNumber: lineIndex + 1 };
        } else if (position === 'RW') {
          line.rightWing = { ...player, position: 'RW', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD') {
          line.leftDefense = { ...player, position: 'LD', lineNumber: lineIndex + 1 };
        } else if (position === 'RD') {
          line.rightDefense = { ...player, position: 'RD', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'goalies') {
        newLines.goalies.push({ ...player, position: 'G' });
      }
      
      // Remove player from available players
      newAvailablePlayers = newAvailablePlayers.filter(p => p.id !== player.id);
    }
    
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
  };

  return {
    updatePlayerPosition
  };
}
