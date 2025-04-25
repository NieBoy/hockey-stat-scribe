
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
      if (!line) return; // Safety check
      
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
      if (!line) return; // Safety check
      
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
    if (sourceLineType === 'forwards' && sourceLineIndex >= 0 && sourceLineIndex < newLines.forwards.length) {
      const line = newLines.forwards[sourceLineIndex];
      if (sourcePosition === 'LW' && line.leftWing?.id === player.id) line.leftWing = null;
      else if (sourcePosition === 'C' && line.center?.id === player.id) line.center = null;
      else if (sourcePosition === 'RW' && line.rightWing?.id === player.id) line.rightWing = null;
    } else if (sourceLineType === 'defense' && sourceLineIndex >= 0 && sourceLineIndex < newLines.defense.length) {
      const line = newLines.defense[sourceLineIndex];
      if (sourcePosition === 'LD' && line.leftDefense?.id === player.id) line.leftDefense = null;
      else if (sourcePosition === 'RD' && line.rightDefense?.id === player.id) line.rightDefense = null;
    } else if (sourceLineType === 'goalies') {
      newLines.goalies = newLines.goalies.filter(g => g.id !== player.id);
    }
    
    // Place the player in their new position
    if (targetLineType === 'forwards' && targetLineIndex >= 0 && targetLineIndex < newLines.forwards.length) {
      const line = newLines.forwards[targetLineIndex];
      if (targetPosition === 'LW') line.leftWing = cloneDeep({...player, position: 'LW', lineNumber: targetLineIndex + 1});
      else if (targetPosition === 'C') line.center = cloneDeep({...player, position: 'C', lineNumber: targetLineIndex + 1});
      else if (targetPosition === 'RW') line.rightWing = cloneDeep({...player, position: 'RW', lineNumber: targetLineIndex + 1});
    } else if (targetLineType === 'defense' && targetLineIndex >= 0 && targetLineIndex < newLines.defense.length) {
      const line = newLines.defense[targetLineIndex];
      if (targetPosition === 'LD') line.leftDefense = cloneDeep({...player, position: 'LD', lineNumber: targetLineIndex + 1});
      else if (targetPosition === 'RD') line.rightDefense = cloneDeep({...player, position: 'RD', lineNumber: targetLineIndex + 1});
    } else if (targetLineType === 'goalies') {
      if (targetPosition === 'G') {
        const updatedPlayer = cloneDeep({...player, position: 'G'});
        
        if (targetLineIndex >= newLines.goalies.length) {
          newLines.goalies.push(updatedPlayer);
        } else {
          newLines.goalies.splice(targetLineIndex, 0, updatedPlayer);
        }
      }
    }
    
    // Update available players - remove the player that was moved
    const updatedAvailablePlayers = newAvailablePlayers.filter(p => p.id !== player.id);
    
    // If there was a displaced player, add them back to available players
    if (displacedPlayer) {
      updatedAvailablePlayers.push(displacedPlayer);
    }
    
    setLines(newLines);
    setAvailablePlayers(updatedAvailablePlayers);
  };

  return {
    handlePlayerMove
  };
}
