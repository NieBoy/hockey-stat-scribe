
import { Team, Lines, User } from "@/types";

export function getAvailablePlayers(team: Team, lines: Lines): User[] {
  console.log("Getting available players for team:", team?.id);
  console.log("Total team players:", team?.players?.length || 0);
  
  if (!team?.players) {
    console.warn("No team players found");
    return [];
  }

  // Create a set of all player IDs already in lines
  const assignedPlayerIds = new Set<string>();
  
  // Debug info for assigned player tracking
  console.log("Tracking players already assigned to positions:");
  
  // Add all players from forwards
  lines.forwards.forEach(line => {
    if (line.leftWing) {
      assignedPlayerIds.add(line.leftWing.id);
      console.log(`Added LW ${line.leftWing.name} (${line.leftWing.id}) to assigned players`);
    }
    if (line.center) {
      assignedPlayerIds.add(line.center.id);
      console.log(`Added C ${line.center.name} (${line.center.id}) to assigned players`);
    }
    if (line.rightWing) {
      assignedPlayerIds.add(line.rightWing.id);
      console.log(`Added RW ${line.rightWing.name} (${line.rightWing.id}) to assigned players`);
    }
  });
  
  // Add all players from defense
  lines.defense.forEach(line => {
    if (line.leftDefense) {
      assignedPlayerIds.add(line.leftDefense.id);
      console.log(`Added LD ${line.leftDefense.name} (${line.leftDefense.id}) to assigned players`);
    }
    if (line.rightDefense) {
      assignedPlayerIds.add(line.rightDefense.id);
      console.log(`Added RD ${line.rightDefense.name} (${line.rightDefense.id}) to assigned players`);
    }
  });
  
  // Add all goalies
  lines.goalies.forEach(goalie => {
    assignedPlayerIds.add(goalie.id);
    console.log(`Added G ${goalie.name} (${goalie.id}) to assigned players`);
  });
  
  // Return all players not already assigned
  const availablePlayers = team.players.filter(player => {
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
}
