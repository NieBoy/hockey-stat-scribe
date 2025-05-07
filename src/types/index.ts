
export type Role = "admin" | "user" | "coach" | "player" | "parent";
export type Theme = "light" | "dark" | "system";
export type StatType = "goals" | "assists" | "shots" | "saves" | "penalties" | "plusMinus" | "faceoffs" | "hits";
export type TeamType = "home" | "away";

/**
 * User
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  // Added fields needed by components
  position?: string;
  number?: string;
  teams?: Team[];
  isAdmin?: boolean;
}

/**
 * Organization
 */
export interface Organization {
  id: string;
  name: string;
}

/**
 * Team
 */
export interface Team {
  id: string;
  name: string;
  organization_id: string;
  logo_url?: string;
  // Added fields used in components
  players?: Player[] | User[];
  lines?: Lines;
  coaches?: User[];
}

/**
 * Player
 */
export interface Player {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  position?: string;
  line_number?: number;
  name?: string;
  email?: string;
  avatar_url?: string | null;
  number?: string;
}

/**
 * Game
 */
export interface Game {
  id: string;
  home_team_id: string;
  away_team_id: string;
  date: string;
  location: string;
  periods: number;
  current_period: number;
  is_active: boolean;
  homeTeam: TeamDetails;
  awayTeam: TeamDetails;
  statTrackers: StatTracker[];
  // Added field needed by components
  opponent_name?: string;
  isActive?: boolean;
}

/**
 * Team Details
 */
export interface TeamDetails {
  id: string;
  name: string;
  logo_url?: string;
  players: Player[];
  organization_id?: string;
  lines?: Lines;
}

/**
 * Stat Tracker
 */
export interface StatTracker {
  id: string;
  game_id: string;
  user_id: string;
  statTypes: string[];
  user: User;
}

/**
 * Game stat
 */
export interface GameStat {
  id: string;
  gameId?: string;
  game_id?: string;
  playerId?: string;
  player_id?: string;
  statType?: string;
  stat_type?: string;
  period: number;
  value: number;
  timestamp: string;
}

/**
 * Player stat
 */
export interface PlayerStat {
  id: string;
  player_id: string;
  stat_type: string;
  value: number;
  games_played: number;
  playerName?: string;
  // Add alias properties to accommodate both naming conventions
  statType?: string;
  playerId?: string;
  gamesPlayed?: number;
}

/**
 * Game event
 */
export interface GameEvent {
  id: string;
  game_id: string;
  event_type: string;
  period: number;
  team_type: string;
  timestamp: string;
}

/**
 * Game Form State
 */
export interface GameFormState {
  date: Date;
  homeTeam: string;
  opponentName?: string;
  awayTeam?: string;
  location: string;
  periods: number;
}

/**
 * Invitation
 */
export interface Invitation {
  id: string;
  email: string;
  role: Role;
  team_id?: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
}

/**
 * Position type for lineup management
 */
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G' | '';

/**
 * Forward line for lineup management
 */
export interface ForwardLine {
  lineNumber: number;
  leftWing: Player | User | null;
  center: Player | User | null;
  rightWing: Player | User | null;
}

/**
 * Defense pair for lineup management
 */
export interface DefenseLine {
  lineNumber: number;
  leftDefense: Player | User | null;
  rightDefense: Player | User | null;
}

/**
 * Lines for team lineup management
 */
export interface Lines {
  forwards: ForwardLine[];
  defense: DefenseLine[];
  goalies: (Player | User | null)[];
}
