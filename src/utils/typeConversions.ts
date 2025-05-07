
import { Team, TeamDetails, User, Player } from "@/types";

/**
 * Convert TeamDetails to conform to Team interface
 */
export function ensureTeamCompatibility(teamDetails: TeamDetails): Team {
  return {
    ...teamDetails,
    organization_id: teamDetails.organization_id || '',
  };
}

/**
 * Convert Player to User
 */
export function convertPlayerToUser(player: Player): User {
  return {
    id: player.id,
    name: player.name || '',
    email: player.email || '',
    avatar_url: player.avatar_url || null,
    role: player.role as any,
    position: player.position,
    number: player.number
  };
}

/**
 * Convert array of Players to Users
 */
export function convertPlayersToUsers(players: Player[]): User[] {
  return players.map(convertPlayerToUser);
}

