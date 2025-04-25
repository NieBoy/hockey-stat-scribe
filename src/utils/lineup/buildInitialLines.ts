
import { Team, Lines, ForwardLine, DefenseLine, User } from "@/types";
import { LineupBuildOptions, LineupValidationResult, ValidationResult } from "./types";

/**
 * Validates the structure of team data before building lines
 */
const validateTeamData = (team: Team): ValidationResult => {
  if (!team) {
    return { isValid: false, error: "No team provided to buildInitialLines" };
  }
  
  if (!team.players) {
    return { isValid: false, error: "Team has no players array" };
  }
  
  return { isValid: true };
};

/**
 * Creates an empty lines structure with default values
 */
function createEmptyLines(): Lines {
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

/**
 * Builds initial lines structure from team data with proper validation
 */
export function buildInitialLines(team: Team, options: LineupBuildOptions = {}): Lines {
  console.log("Building lines from team data", team);
  
  const validation = validateTeamData(team);
  if (!validation.isValid) {
    console.error(validation.error);
    return createEmptyLines();
  }
  
  try {
    const forwards: ForwardLine[] = [];
    const defense: DefenseLine[] = [];
    const goalies: User[] = [];
    
    if (!team.players) {
      console.warn("No team data provided for building lines");
      return createEmptyLines();
    }
    
    // Process each player with proper validation
    team.players.forEach(player => {
      if (!player) return;
      if (!player.position) {
        console.log(`Player ${player.name} has no position assigned`);
        return;
      }
      
      console.log(`Processing player: ${player.name}, position: ${player.position}, line: ${player.lineNumber || 'none'}`);
      
      const lineNumber = player.lineNumber || 1;
      
      if (player.position === 'LW' || player.position === 'C' || player.position === 'RW') {
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
      else {
        console.warn(`Invalid position ${player.position} for player ${player.name}`);
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
    
  } catch (error) {
    console.error("Error building initial lines:", error);
    return createEmptyLines();
  }
}
