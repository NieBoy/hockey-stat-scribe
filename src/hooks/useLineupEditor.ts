
import { useState } from "react";
import { Team, Lines, User, Position } from "@/types";
import { buildInitialLines, getAvailablePlayers, removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

interface PlayerMoveParams {
  playerId: string;
  sourceType: 'forward' | 'defense' | 'goalie' | 'roster';
  sourceLineNumber: number;
  sourcePosition: Position | null;
  destType: 'forward' | 'defense' | 'goalie' | 'pp' | 'pk' | 'remove';
  destLineNumber: number;
  destPosition: Position | null;
}

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

  // Handle player move via drag and drop
  const handlePlayerMove = ({ 
    playerId, 
    sourceType,
    sourceLineNumber,
    sourcePosition,
    destType,
    destLineNumber,
    destPosition 
  }: PlayerMoveParams) => {
    // Create copies to avoid direct state mutation
    const newLines = JSON.parse(JSON.stringify(lines)) as Lines;
    let newAvailablePlayers = [...availablePlayers];
    
    // Find the player, either in the lines or in available players
    let player: User | null = null;
    
    // Check if player is in available roster (when dragging from roster)
    if (sourceType === 'roster') {
      const playerIndex = newAvailablePlayers.findIndex(p => p.id === playerId);
      if (playerIndex >= 0) {
        player = newAvailablePlayers[playerIndex];
        // Remove from available players if being assigned
        if (destType !== 'remove') {
          newAvailablePlayers.splice(playerIndex, 1);
        }
      }
    }
    // Find player in lines and remove from current position
    else {
      // Find and remove player from source
      if (sourceType === 'forward' && sourcePosition) {
        const line = newLines.forwards[sourceLineNumber - 1];
        if (sourcePosition === 'LW' && line.leftWing?.id === playerId) {
          player = line.leftWing;
          line.leftWing = null;
        } else if (sourcePosition === 'C' && line.center?.id === playerId) {
          player = line.center;
          line.center = null;
        } else if (sourcePosition === 'RW' && line.rightWing?.id === playerId) {
          player = line.rightWing;
          line.rightWing = null;
        }
      } else if (sourceType === 'defense' && sourcePosition) {
        const line = newLines.defense[sourceLineNumber - 1];
        if (sourcePosition === 'LD' && line.leftDefense?.id === playerId) {
          player = line.leftDefense;
          line.leftDefense = null;
        } else if (sourcePosition === 'RD' && line.rightDefense?.id === playerId) {
          player = line.rightDefense;
          line.rightDefense = null;
        }
      } else if (sourceType === 'goalie') {
        const goalieIndex = newLines.goalies.findIndex(g => g.id === playerId);
        if (goalieIndex >= 0) {
          player = newLines.goalies[goalieIndex];
          newLines.goalies.splice(goalieIndex, 1);
        }
      }
    }
    
    // If player not found or destination is to remove, add to available players
    if (!player || destType === 'remove') {
      // Find original player in team roster
      const originalPlayer = team.players.find(p => p.id === playerId);
      if (originalPlayer) {
        newAvailablePlayers.push(originalPlayer);
      }
      setAvailablePlayers(newAvailablePlayers);
      setLines(newLines);
      return;
    }
    
    // Add player to destination
    if (destType === 'forward' && destPosition) {
      const line = newLines.forwards[destLineNumber - 1];
      
      // Check if there's already a player in that position
      let displacedPlayer: User | null = null;
      
      if (destPosition === 'LW') {
        displacedPlayer = line.leftWing;
        line.leftWing = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'C') {
        displacedPlayer = line.center;
        line.center = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'RW') {
        displacedPlayer = line.rightWing;
        line.rightWing = { ...player, position: destPosition, lineNumber: destLineNumber };
      }
      
      // Add displaced player to available players if any
      if (displacedPlayer) {
        newAvailablePlayers.push(displacedPlayer);
      }
    } 
    else if (destType === 'defense' && destPosition) {
      const line = newLines.defense[destLineNumber - 1];
      
      // Check if there's already a player in that position
      let displacedPlayer: User | null = null;
      
      if (destPosition === 'LD') {
        displacedPlayer = line.leftDefense;
        line.leftDefense = { ...player, position: destPosition, lineNumber: destLineNumber };
      } else if (destPosition === 'RD') {
        displacedPlayer = line.rightDefense;
        line.rightDefense = { ...player, position: destPosition, lineNumber: destLineNumber };
      }
      
      // Add displaced player to available players if any
      if (displacedPlayer) {
        newAvailablePlayers.push(displacedPlayer);
      }
    }
    else if (destType === 'goalie') {
      // Add as goalie
      newLines.goalies.push({ ...player, position: 'G' });
    }
    
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
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
    addDefenseLine,
    handlePlayerMove
  };
}
