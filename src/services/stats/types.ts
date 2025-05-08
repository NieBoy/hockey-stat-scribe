
/**
 * Important note on player IDs:
 * 
 * Throughout the system we use team_member.id as the primary identifier for players,
 * not user.id or any other identifier.
 * 
 * When referring to "playerId" in parameters or fields, this is ALWAYS referring
 * to team_member.id unless explicitly stated otherwise.
 * 
 * This is especially important for:
 * - Stats storage and retrieval
 * - Game events and game stats
 * - Player validation
 */

/**
 * Player stat with metadata
 */
export interface PlayerStatWithMetadata {
  id?: string;            // Database record ID
  playerId: string;       // team_member.id (not user.id)
  playerName?: string;    // Display name of the player
  statType: string;       // Type of statistic (goals, assists, etc)
  value: number;          // Numerical value of the stat
  gamesPlayed: number;    // Number of games this stat covers
}

/**
 * Game event participant
 */
export interface EventPlayer {
  id: string;             // team_member.id (not user.id)
  name: string;           // Display name of the player
  role: string;           // Role in this event (scorer, assist, etc)
}

/**
 * Game stat record
 */
export interface GameStatRecord {
  id: string;             // Database record ID
  gameId: string;         // ID of the game this stat belongs to
  playerId: string;       // team_member.id (not user.id)
  statType: string;       // Type of statistic
  period: number;         // Game period when this stat occurred
  value: number;          // Value of the stat
  timestamp: string;      // When the stat was recorded
}

/**
 * Player reference for consistent ID handling
 */
export interface PlayerReference {
  id: string;             // team_member.id (not user.id)  
  name: string;           // Display name of the player
  teamId: string;         // ID of the player's team
}
