
import { Team, Lines, User, ForwardLine, DefenseLine } from "@/types";

/**
 * Builds initial lines structure from team data
 */
export function buildInitialLines(team: Team): Lines {
  console.log("Building lines from team data", team);
  
  const forwards: ForwardLine[] = [];
  const defense: DefenseLine[] = [];
  const goalies: User[] = [];
  
  if (!team || !team.players) {
    console.warn("No team data provided for building lines");
    // Return default empty lines structure
    return {
      forwards: [{ lineNumber: 1, leftWing: null, center: null, rightWing: null }],
      defense: [{ lineNumber: 1, leftDefense: null, rightDefense: null }],
      goalies: [],
      specialTeams: {
        powerPlay: {},
        penaltyKill: {}
      }
    };
  }
  
  // Find all players with positions and their line numbers
  team.players.forEach(player => {
    if (!player.position) return;
    
    console.log(`Processing player: ${player.name}, position: ${player.position}, line: ${player.lineNumber || 'none'}`);
    
    if (player.position === 'LW' || player.position === 'C' || player.position === 'RW') {
      const lineNumber = player.lineNumber || 1;
      let line = forwards.find(l => l.lineNumber === lineNumber);
      
      if (!line) {
        line = { lineNumber, leftWing: null, center: null, rightWing: null };
        forwards.push(line);
      }
      
      if (player.position === 'LW') line.leftWing = player;
      if (player.position === 'C') line.center = player;
      if (player.position === 'RW') line.rightWing = player;
    } 
    else if (player.position === 'LD' || player.position === 'RD') {
      const lineNumber = player.lineNumber || 1;
      let line = defense.find(l => l.lineNumber === lineNumber);
      
      if (!line) {
        line = { lineNumber, leftDefense: null, rightDefense: null };
        defense.push(line);
      }
      
      if (player.position === 'LD') line.leftDefense = player;
      if (player.position === 'RD') line.rightDefense = player;
    }
    else if (player.position === 'G') {
      goalies.push(player);
    }
  });
  
  // Sort lines by line number
  forwards.sort((a, b) => a.lineNumber - b.lineNumber);
  defense.sort((a, b) => a.lineNumber - b.lineNumber);
  
  // Ensure at least one line for each type
  if (forwards.length === 0) {
    forwards.push({ lineNumber: 1, leftWing: null, center: null, rightWing: null });
  }
  
  if (defense.length === 0) {
    defense.push({ lineNumber: 1, leftDefense: null, rightDefense: null });
  }
  
  // Initialize with empty special teams
  const result = { 
    forwards, 
    defense, 
    goalies,
    specialTeams: {
      powerPlay: {},
      penaltyKill: {}
    }
  };
  
  console.log("Final lines structure:", result);
  
  return result;
}

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

/**
 * Removes a player from their current position in the lineup
 */
export const removePlayerFromCurrentPosition = (playerId: string, lines: Lines) => {
  // Check forwards
  for (let i = 0; i < lines.forwards.length; i++) {
    const line = lines.forwards[i];
    if (line.leftWing?.id === playerId) line.leftWing = null;
    if (line.center?.id === playerId) line.center = null;
    if (line.rightWing?.id === playerId) line.rightWing = null;
  }
  
  // Check defense
  for (let i = 0; i < lines.defense.length; i++) {
    const line = lines.defense[i];
    if (line.leftDefense?.id === playerId) line.leftDefense = null;
    if (line.rightDefense?.id === playerId) line.rightDefense = null;
  }
  
  // Check goalies
  lines.goalies = lines.goalies.filter(g => g.id !== playerId);
  
  // Check special teams
  if (lines.specialTeams) {
    // Check power play
    if (lines.specialTeams.powerPlay) {
      Object.keys(lines.specialTeams.powerPlay).forEach(key => {
        if (lines.specialTeams?.powerPlay?.[key]?.id === playerId) {
          if (lines.specialTeams?.powerPlay) {
            lines.specialTeams.powerPlay[key] = null;
          }
        }
      });
    }
    
    // Check penalty kill
    if (lines.specialTeams.penaltyKill) {
      Object.keys(lines.specialTeams.penaltyKill).forEach(key => {
        if (lines.specialTeams?.penaltyKill?.[key]?.id === playerId) {
          if (lines.specialTeams?.penaltyKill) {
            lines.specialTeams.penaltyKill[key] = null;
          }
        }
      });
    }
  }
};
