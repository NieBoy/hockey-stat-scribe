
// Fix issues with playerPositions.ts to correctly handle unknown types
import { User, Lines } from '@/types';
import { LinePosition } from './types';

export function getSomeFunction() {
  // Modify the functions at lines 73 and 83 to correctly handle unknown types
  
  const handlePlayerItem = (item: unknown) => {
    // Make sure item is an object with an id property
    if (item && typeof item === 'object' && 'id' in item) {
      return item.id;
    }
    return null;
  };
  
  // Replace any usages of direct access like item.id with the function above
}

/**
 * Removes a player from their current position in the lineup
 * @param lines Current lineup data
 * @param playerId ID of the player to remove
 * @returns Updated lineup with player removed from their position
 */
export function removePlayerFromCurrentPosition(lines: Lines, playerId: string): Lines {
  if (!lines || !playerId) return lines;
  
  const updatedLines = { ...lines };

  // Check forward lines
  updatedLines.forwards = updatedLines.forwards.map(line => ({
    ...line,
    leftWing: line.leftWing && line.leftWing.id === playerId ? null : line.leftWing,
    center: line.center && line.center.id === playerId ? null : line.center,
    rightWing: line.rightWing && line.rightWing.id === playerId ? null : line.rightWing
  }));

  // Check defense pairs
  updatedLines.defense = updatedLines.defense.map(line => ({
    ...line,
    leftDefense: line.leftDefense && line.leftDefense.id === playerId ? null : line.leftDefense,
    rightDefense: line.rightDefense && line.rightDefense.id === playerId ? null : line.rightDefense
  }));

  // Check goalies
  updatedLines.goalies = updatedLines.goalies.map(goalie => 
    goalie && goalie.id === playerId ? null : goalie
  );

  return updatedLines;
}
