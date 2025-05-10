
import { User, Player, Team, Role, TeamDetails, Game } from '@/types';

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
  
  // Make sure players have the required role property
  const playersWithRole = players.map(player => {
    if (!player.role) {
      return { ...player, role: 'player' as Role };
    }
    return player;
  });
  
  return {
    id: teamData.id || '',
    name: teamData.name || '',
    players: playersWithRole,
    coaches: Array.isArray(teamData.coaches) ? teamData.coaches.map(coach => 
      coach.role ? coach : { ...coach, role: 'coach' as Role }
    ) : [],
    parents: Array.isArray(teamData.parents) ? teamData.parents.map(parent => 
      parent.role ? parent : { ...parent, role: 'parent' as Role }
    ) : [],
    organization_id: teamData.organization_id || ''
  };
}

/**
 * Ensures a team details object has the right shape
 */
export function ensureTeamDetailsCompatibility(teamData: any): TeamDetails {
  if (!teamData) return null;
  
  // Make sure players have the required role property
  const players = Array.isArray(teamData.players) ? teamData.players.map(player => {
    if (!player.role) {
      return { ...player, role: 'player' as Role };
    }
    return player;
  }) : [];
  
  return {
    id: teamData.id || '',
    name: teamData.name || '',
    players: players,
    coaches: Array.isArray(teamData.coaches) ? teamData.coaches.map(coach => 
      coach.role ? coach : { ...coach, role: 'coach' as Role }
    ) : [],
    organization_id: teamData.organization_id || ''
  };
}

/**
 * Ensures a Game object has the required properties, including both camelCase and snake_case
 */
export function ensureGameCompatibility(gameData: any): Game {
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
