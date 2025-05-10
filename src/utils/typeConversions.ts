
import { User, Player, Team, Role, TeamDetails } from '@/types';

/**
 * Converts a Player object to a User object
 */
export function playerToUser(player: Player): User {
  // Convert string role to Role type when needed
  let roleValue: Role | Role[];
  
  if (typeof player.role === 'string') {
    roleValue = player.role as Role;
  } else if (Array.isArray(player.role)) {
    roleValue = player.role as Role[];
  } else {
    // Default fallback if role is somehow undefined or invalid
    roleValue = 'player' as Role;
  }
    
  return {
    id: player.id,
    name: player.name,
    email: player.email || '',
    avatar_url: player.avatar_url,
    role: roleValue,
    position: player.position,
    number: player.number,
    lineNumber: player.lineNumber,
    teams: player.teams
  };
}

/**
 * Converts an array of Player objects to User objects
 */
export function convertPlayersToUsers(players: Player[]): User[] {
  if (!players) return [];
  return players.map(playerToUser);
}

/**
 * Ensures a team object has the right shape for components expecting Team type
 */
export function ensureTeamCompatibility(teamData: any): Team {
  if (!teamData) return null;
  
  // Make sure players exists and is an array
  const players = Array.isArray(teamData.players) ? teamData.players : [];
  
  return {
    id: teamData.id || '',
    name: teamData.name || '',
    players: players,
    coaches: Array.isArray(teamData.coaches) ? teamData.coaches : [],
    parents: Array.isArray(teamData.parents) ? teamData.parents : [],
    organization_id: teamData.organization_id || ''
  };
}

/**
 * Ensures a team details object has the right shape
 */
export function ensureTeamDetailsCompatibility(teamData: any): TeamDetails {
  if (!teamData) return null;
  
  return {
    id: teamData.id || '',
    name: teamData.name || '',
    players: Array.isArray(teamData.players) ? teamData.players : [],
    coaches: Array.isArray(teamData.coaches) ? teamData.coaches : [],
    organization_id: teamData.organization_id || ''
  };
}

/**
 * Ensures a Game object has the required properties
 */
export function ensureGameCompatibility(gameData: any): any {
  if (!gameData) return null;
  
  // Add both camelCase and snake_case properties to ensure compatibility
  return {
    ...gameData,
    home_team_id: gameData.home_team_id || (gameData.homeTeam?.id || ''),
    away_team_id: gameData.away_team_id || (gameData.awayTeam?.id || ''),
    homeTeam: ensureTeamDetailsCompatibility(gameData.homeTeam),
    awayTeam: ensureTeamDetailsCompatibility(gameData.awayTeam)
  };
}
