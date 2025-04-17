
import { useState } from "react";
import { Team, Lines, User, Position } from "@/types";
import { buildInitialLines, getAvailablePlayers, removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

export function useLineupEditor(team: Team) {
  // Initialize lines with existing player positions
  const initialLines = buildInitialLines(team);
  const [lines, setLines] = useState<Lines>(initialLines);
  
  // Available players for selection (not already assigned)
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(
    getAvailablePlayers(team, initialLines)
  );

  const handlePlayerSelect = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    // Deep copy lines to avoid direct state mutation
    const newLines = { ...lines };
    
    // Handle player removal from current position first
    let playerToMove: User | null = null;
    
    // Find player in team
    const player = team.players.find(p => p.id === playerId);
    
    if (!player) return;
    
    if (playerId === 'none') {
      // Handle removing a player (empty selection)
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
    } else {
      // Find if this player is already assigned somewhere
      removePlayerFromCurrentPosition(playerId, newLines);
      
      // Add player to new position
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW') {
          // If there is already a player in this position, add them back to available
          if (line.leftWing) setAvailablePlayers([...availablePlayers, line.leftWing]);
          line.leftWing = { ...player, position: 'LW', lineNumber: lineIndex + 1 };
        } else if (position === 'C') {
          if (line.center) setAvailablePlayers([...availablePlayers, line.center]);
          line.center = { ...player, position: 'C', lineNumber: lineIndex + 1 };
        } else if (position === 'RW') {
          if (line.rightWing) setAvailablePlayers([...availablePlayers, line.rightWing]);
          line.rightWing = { ...player, position: 'RW', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD') {
          if (line.leftDefense) setAvailablePlayers([...availablePlayers, line.leftDefense]);
          line.leftDefense = { ...player, position: 'LD', lineNumber: lineIndex + 1 };
        } else if (position === 'RD') {
          if (line.rightDefense) setAvailablePlayers([...availablePlayers, line.rightDefense]);
          line.rightDefense = { ...player, position: 'RD', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'goalies') {
        newLines.goalies = [...newLines.goalies, { ...player, position: 'G' }];
      }
      
      // Remove player from available list
      setAvailablePlayers(availablePlayers.filter(p => p.id !== playerId));
    }
    
    // If we removed a player, add them back to available players
    if (playerToMove) {
      setAvailablePlayers([...availablePlayers, playerToMove]);
    }
    
    setLines(newLines);
  };

  const addForwardLine = () => {
    const newLines = { ...lines };
    newLines.forwards.push({
      lineNumber: newLines.forwards.length + 1,
      leftWing: null,
      center: null,
      rightWing: null
    });
    setLines(newLines);
  };

  const addDefenseLine = () => {
    const newLines = { ...lines };
    newLines.defense.push({
      lineNumber: newLines.defense.length + 1,
      leftDefense: null,
      rightDefense: null
    });
    setLines(newLines);
  };

  return {
    lines,
    setLines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine
  };
}
