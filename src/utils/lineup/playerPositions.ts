
import { Lines } from "@/types";
import { PlayerPositionUpdate, ValidationResult } from "./types";

const validateRemovalParams = (playerId: string, lines: Lines): ValidationResult => {
  if (!playerId || !lines) {
    return { 
      isValid: false, 
      error: "Invalid parameters provided to removePlayerFromCurrentPosition" 
    };
  }
  return { isValid: true };
};

/**
 * Removes a player from their current position in the lineup
 * Enhanced with better cleanup and logging
 */
export const removePlayerFromCurrentPosition = (playerId: string, lines: Lines): void => {
  const validation = validateRemovalParams(playerId, lines);
  if (!validation.isValid) {
    console.error(validation.error);
    return;
  }

  console.log(`Removing player ${playerId} from all positions`);

  try {
    // Check and clean forwards
    lines.forwards.forEach((line, lineIndex) => {
      if (!line) return;
      
      if (line.leftWing?.id === playerId) {
        console.log(`Removing player from LW position in forward line ${lineIndex + 1}`);
        line.leftWing = null;
      }
      if (line.center?.id === playerId) {
        console.log(`Removing player from C position in forward line ${lineIndex + 1}`);
        line.center = null;
      }
      if (line.rightWing?.id === playerId) {
        console.log(`Removing player from RW position in forward line ${lineIndex + 1}`);
        line.rightWing = null;
      }
    });
    
    // Check and clean defense
    lines.defense.forEach((line, lineIndex) => {
      if (!line) return;
      
      if (line.leftDefense?.id === playerId) {
        console.log(`Removing player from LD position in defense pair ${lineIndex + 1}`);
        line.leftDefense = null;
      }
      if (line.rightDefense?.id === playerId) {
        console.log(`Removing player from RD position in defense pair ${lineIndex + 1}`);
        line.rightDefense = null;
      }
    });
    
    // Clean goalies with proper logging
    const originalLength = lines.goalies.length;
    lines.goalies = lines.goalies.filter(g => g?.id !== playerId);
    if (lines.goalies.length < originalLength) {
      console.log(`Removed player from goalies list`);
    }
    
    // Clean special teams
    if (lines.specialTeams) {
      // Clean power play
      if (lines.specialTeams.powerPlay) {
        Object.entries(lines.specialTeams.powerPlay).forEach(([key, player]) => {
          if (player?.id === playerId) {
            console.log(`Removing player from power play position ${key}`);
            lines.specialTeams!.powerPlay![key] = null;
          }
        });
      }
      
      // Clean penalty kill
      if (lines.specialTeams.penaltyKill) {
        Object.entries(lines.specialTeams.penaltyKill).forEach(([key, player]) => {
          if (player?.id === playerId) {
            console.log(`Removing player from penalty kill position ${key}`);
            lines.specialTeams!.penaltyKill![key] = null;
          }
        });
      }
    }

    console.log(`Successfully removed player ${playerId} from all positions`);
  } catch (error) {
    console.error("Error in removePlayerFromCurrentPosition:", error);
    throw new Error(
      `Failed to remove player ${playerId} from lineup: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
