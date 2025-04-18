
import { Lines, User, Position } from "@/types";
import { cloneDeep } from "lodash";

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
    console.log(`usePlayerManagement: Updating player position`, {
      lineType,
      lineIndex,
      position,
      playerId: player?.id || 'none'
    });
    
    // Create deep copies to prevent mutation issues
    const newLines = cloneDeep(lines);
    let newAvailablePlayers = cloneDeep(availablePlayers);
    
    // Handle removing existing player from position
    if (lineType === 'forwards') {
      // Make sure the line exists
      if (!newLines.forwards[lineIndex]) {
        console.warn(`Forward line ${lineIndex} does not exist`);
        return;
      }
      
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
      // Make sure the line exists
      if (!newLines.defense[lineIndex]) {
        console.warn(`Defense line ${lineIndex} does not exist`);
        return;
      }
      
      const line = newLines.defense[lineIndex];
      if (position === 'LD' && line.leftDefense) {
        newAvailablePlayers.push(line.leftDefense);
        line.leftDefense = null;
      } else if (position === 'RD' && line.rightDefense) {
        newAvailablePlayers.push(line.rightDefense);
        line.rightDefense = null;
      }
    } else if (lineType === 'goalies') {
      // For goalies, we need to handle differently since it's an array
      if (position === 'G' && lineIndex < newLines.goalies.length) {
        const removedGoalie = newLines.goalies.splice(lineIndex, 1)[0];
        if (removedGoalie) {
          newAvailablePlayers.push(removedGoalie);
        }
      }
    }
    
    // Add new player to position if provided
    if (player) {
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (line) {
          if (position === 'LW') line.leftWing = { ...player, position: 'LW', lineNumber: lineIndex + 1 };
          else if (position === 'C') line.center = { ...player, position: 'C', lineNumber: lineIndex + 1 };
          else if (position === 'RW') line.rightWing = { ...player, position: 'RW', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (line) {
          if (position === 'LD') line.leftDefense = { ...player, position: 'LD', lineNumber: lineIndex + 1 };
          else if (position === 'RD') line.rightDefense = { ...player, position: 'RD', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'goalies') {
        if (position === 'G') {
          // For goalies we push to the array
          newLines.goalies.push({ ...player, position: 'G' });
        }
      }
      
      // Remove player from available players
      newAvailablePlayers = newAvailablePlayers.filter(p => p.id !== player.id);
    }
    
    console.log("Setting updated lines:", JSON.stringify(newLines, null, 2));
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
  };

  return {
    updatePlayerPosition
  };
}
