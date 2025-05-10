/**
 * Player stat
 */
export interface PlayerStat {
  id: string;
  player_id: string;
  playerId?: string; // Alias for player_id
  stat_type: string;
  statType?: string; // Alias for stat_type
  value: number;
  games_played: number;
  gamesPlayed?: number; // Alias for games_played
  playerName?: string;
  details?: string | any;
}

/**
 * Position types
 */
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G' | string;

/**
 * User role types
 */
export type Role = 'admin' | 'coach' | 'player' | 'parent' | 'user';

// Adding UserRole for backwards compatibility with existing imports
export type UserRole = Role;

/**
 * User type
 */
export interface User {
  id: string;
  name: string;
  email?: string; // Made email optional to match Player interface
  avatar_url?: string | null;
  role: Role | Role[];
  position?: Position;
  number?: string;
  lineNumber?: number;
  teams?: TeamBasic[];
  children?: User[];
  isAdmin?: boolean;
}

/**
 * Basic team information
 */
export interface TeamBasic {
  id: string;
  name: string;
}

/**
 * Player type - structuring to match User type better
 */
export interface Player {
  id: string;
  name: string;
  email?: string;
  team_id?: string;
  user_id?: string;
  role: Role | Role[]; // Made role type consistent with User
  position?: Position;
  number?: string;
  avatar_url?: string | null;
  lineNumber?: number;
  teams?: TeamBasic[];
}

/**
 * Team type
 */
export interface Team {
  id: string;
  name: string;
  players?: (User | Player)[];
  coaches?: User[];
  parents?: User[];
  organization_id?: string;
  lines?: Lines;
  created_at?: string;
}

/**
 * Team details type
 */
export interface TeamDetails {
  id: string;
  name: string;
  players?: (User | Player)[];
  coaches?: User[];
  organization_id?: string;
}

/**
 * Game type
 */
export interface Game {
  id: string;
  date: string;
  location?: string;
  home_team_id: string;
  away_team_id?: string;
  periods?: number;
  current_period?: number;
  is_active?: boolean;
  isActive?: boolean;
  opponent_name?: string;
  opponent_id?: string;
  homeTeam: TeamDetails;
  awayTeam: TeamDetails;
  statTrackers?: { user: any; statTypes: string[] }[];
}

/**
 * Game form state
 */
export interface GameFormState {
  date: Date;
  time: string;
  location: string;
  periods: number;
  team_id: string;
  opponent_name: string;
  homeTeam?: string;
  opponentName?: string;
  opponent_id?: string;
  is_home: boolean;
  tracker_ids: string[];
}

/**
 * Invitation type
 */
export interface Invitation {
  id: string;
  email: string;
  team_id: string;
  role: Role;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  team?: Team;
  invitedBy?: string;
  expires_at?: string;
}

/**
 * Game stat type
 */
export interface GameStat {
  id: string;
  game_id: string;
  player_id: string;
  player_name?: string;
  stat_type: string;
  period: number;
  value: number;
  timestamp: string;
  details?: string | any;
  // Alias properties to accommodate both naming conventions
  gameId?: string;
  playerId?: string;
  statType?: string;
}

/**
 * Game event type
 */
export interface GameEvent {
  id: string;
  game_id: string;
  period: number;
  time_in_period?: any;
  timestamp: string;
  created_by?: string;
  created_at: string;
  details?: any;
  event_type: string;
  team_type: string;
}

/**
 * Stat type enum
 */
export type StatType = string;

/**
 * Forward line type
 */
export interface ForwardLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
}

/**
 * Defense pair type
 */
export interface DefensePair {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
}

/**
 * Defense line alias for backward compatibility
 */
export type DefenseLine = DefensePair;

/**
 * Lines type
 */
export interface Lines {
  forwards: ForwardLine[];
  defense: DefensePair[];
  goalies: (User | null)[];
  specialTeams?: Record<string, User> | any;
}
