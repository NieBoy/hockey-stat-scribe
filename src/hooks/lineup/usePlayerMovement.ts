
import { useState } from 'react';
import { Lines, User, Position } from '@/types';
import { removePlayerFromCurrentPosition } from '@/utils/lineupUtils';
import { cloneDeep } from 'lodash';

export function usePlayerMovement(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const handlePlayerMove = (
    player: User, 
    sourceLineType: 'forwards' | 'defense' | 'goalies', 
    sourceLineIndex: number,
    sourcePosition: Position, 
    targetLineType: 'forwards' | 'defense' | 'goalies', 
    targetLineIndex: number, 
    targetPosition: Position
  ) => {
    console.log("Moving player:", { 
      player, 
      from: `${sourceLineType} line ${sourceLineIndex} pos ${sourcePosition}`,
      to: `${targetLineType} line ${targetLineIndex} pos ${targetPosition}`
    });
    
    // Create deep copies to prevent mutation issues
    const newLines = cloneDeep(lines);
    const newAvailablePlayers = cloneDeep(availablePlayers);
    
    // First, capture the player that's currently in the target position
    let displacedPlayer: User | null = null;
    
    if (targetLineType === 'forwards') {
      const line = newLines.forwards[targetLineIndex];
      if (targetPosition === 'LW') {
        displacedPlayer = line.leftWing;
        line.leftWing = null;
      } else if (targetPosition === 'C') {
        displacedPlayer = line.center;
        line.center = null;
      } else if (targetPosition === 'RW') {
        displacedPlayer = line.rightWing;
        line.rightWing = null;
      }
    } else if (targetLineType === 'defense') {
      const line = newLines.defense[targetLineIndex];
      if (targetPosition === 'LD') {
        displacedPlayer = line.leftDefense;
        line.leftDefense = null;
      } else if (targetPosition === 'RD') {
        displacedPlayer = line.rightDefense;
        line.rightDefense = null;
      }
    } else if (targetLineType === 'goalies') {
      if (targetLineIndex < newLines.goalies.length) {
        displacedPlayer = newLines.goalies[targetLineIndex];
        newLines.goalies.splice(targetLineIndex, 1);
      }
    }
    
    // Remove the player from their current position
    const sourceLine = sourceLineType === 'forwards' 
      ? newLines.forwards[sourceLineIndex]
      : sourceLineType === 'defense'
        ? newLines.defense[sourceLineIndex]
        : null;
      
    if (sourceLineType === 'forwards' && sourceLine) {
      if (sourcePosition === 'LW') sourceLine.leftWing = null;
      else if (sourcePosition === 'C') sourceLine.center = null;
      else if (sourcePosition === 'RW') sourceLine.rightWing = null;
    } else if (sourceLineType === 'defense' && sourceLine) {
      if (sourcePosition === 'LD') sourceLine.leftDefense = null;
      else if (sourcePosition === 'RD') sourceLine.rightDefense = null;
    } else if (sourceLineType === 'goalies') {
      newLines.goalies = newLines.goalies.filter(g => g.id !== player.id);
    }
    
    // Place the player in their new position
    if (targetLineType === 'forwards') {
      const line = newLines.forwards[targetLineIndex];
      if (targetPosition === 'LW') line.leftWing = cloneDeep(player);
      else if (targetPosition === 'C') line.center = cloneDeep(player);
      else if (targetPosition === 'RW') line.rightWing = cloneDeep(player);
    } else if (targetLineType === 'defense') {
      const line = newLines.defense[targetLineIndex];
      if (targetPosition === 'LD') line.leftDefense = cloneDeep(player);
      else if (targetPosition === 'RD') line.rightDefense = cloneDeep(player);
    } else if (targetLineType === 'goalies') {
      if (targetPosition === 'G') {
        const updatedPlayer = { ...player, position: 'G' };
        
        if (targetLineIndex >= newLines.goalies.length) {
          newLines.goalies.push(updatedPlayer);
        } else {
          newLines.goalies.splice(targetLineIndex, 0, updatedPlayer);
        }
      }
    }
    
    // If there was a displaced player, add them back to available players
    if (displacedPlayer) {
      newAvailablePlayers.push(displacedPlayer);
    }
    
    setLines(newLines);
    setAvailablePlayers(newAvailablePlayers);
  };

  return {
    handlePlayerMove
  };
}
