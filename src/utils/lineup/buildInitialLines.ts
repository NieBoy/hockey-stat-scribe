
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
