
import { Team, Lines, User } from "@/types";
import { ValidationResult } from "./types";

/**
 * Validates input parameters for getting available players
 */
const validateInput = (team: Team, lines: Lines): ValidationResult => {
  if (!team) {
    return { isValid: false, error: "No team provided to getAvailablePlayers" };
  }

  if (!team.players) {
    return { isValid: false, error: "No team players found" };
  }

  return { isValid: true };
};

/**
 * Gets list of players available for lineup assignment
 */
export function getAvailablePlayers(team: Team, lines: Lines): User[] {
  const validation = validateInput(team, lines);
  if (!validation.isValid) {
    console.error(validation.error);
    return [];
  }

  try {
    console.log("Getting available players for team:", team.id);
    console.log("Total team players:", team.players.length);
    
    // Create a set of all player IDs already in lines
    const assignedPlayerIds = new Set<string>();
    
    // Debug info for assigned player tracking
    console.log("Tracking players already assigned to positions:");
    
    // Add all players from forwards with proper null checks
    lines.forwards?.forEach(line => {
      if (line.leftWing?.id) {
        assignedPlayerIds.add(line.leftWing.id);
        console.log(`Added LW ${line.leftWing.name} (${line.leftWing.id}) to assigned players`);
      }
      if (line.center?.id) {
        assignedPlayerIds.add(line.center.id);
        console.log(`Added C ${line.center.name} (${line.center.id}) to assigned players`);
      }
      if (line.rightWing?.id) {
        assignedPlayerIds.add(line.rightWing.id);
        console.log(`Added RW ${line.rightWing.name} (${line.rightWing.id}) to assigned players`);
      }
    });
    
    // Add all players from defense with proper null checks
    lines.defense?.forEach(line => {
      if (line.leftDefense?.id) {
        assignedPlayerIds.add(line.leftDefense.id);
        console.log(`Added LD ${line.leftDefense.name} (${line.leftDefense.id}) to assigned players`);
      }
      if (line.rightDefense?.id) {
        assignedPlayerIds.add(line.rightDefense.id);
        console.log(`Added RD ${line.rightDefense.name} (${line.rightDefense.id}) to assigned players`);
      }
    });
    
    // Add all goalies with proper null checks
    lines.goalies?.forEach(goalie => {
      if (goalie?.id) {
        assignedPlayerIds.add(goalie.id);
        console.log(`Added G ${goalie.name} (${goalie.id}) to assigned players`);
      }
    });
    
    // Return all players not already assigned with validation
    const availablePlayers = team.players.filter(player => {
      if (!player?.id) {
        console.warn("Found player without ID:", player);
        return false;
      }
      const isAvailable = !assignedPlayerIds.has(player.id);
      console.log(`Player ${player.name} (${player.id}): ${isAvailable ? 'available' : 'assigned'}`);
      return isAvailable;
    });
    
    console.log(`Found ${availablePlayers.length} available players out of ${team.players.length} total`);
    console.log("Available players details:", availablePlayers.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position
    })));
    
    return availablePlayers;
  } catch (error) {
    console.error("Error in getAvailablePlayers:", error);
    return [];
  }
}
