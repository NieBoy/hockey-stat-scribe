
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
 * Position types
 */
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G' | string;

/**
 * User role types
 */
export type Role = 'admin' | 'coach' | 'player' | 'parent' | 'user';

/**
 * User type
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role | Role[];
  position?: Position;
  number?: string;
  lineNumber?: number;
  teams?: TeamBasic[];
  children?: User[];
}

/**
 * Basic team information
 */
export interface TeamBasic {
  id: string;
  name: string;
}

/**
 * Player type
 */
export interface Player {
  id: string;
  name: string;
  email?: string;
  team_id?: string;
  user_id?: string;
  role: string | Role[];
  position?: Position;
  number?: string;
  avatar_url?: string | null;
  lineNumber?: number;
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
  organization_id: string;
  lines?: Lines;
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
  away_team_id: string;
  periods?: number;
  current_period?: number;
  is_active?: boolean;
  isActive?: boolean;
  opponent_name?: string;
  homeTeam: TeamDetails;
  awayTeam: TeamDetails;
  statTrackers?: User[];
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
}

/**
 * Game stat type
 */
export interface GameStat {
  id: string;
  game_id: string;
  player_id: string;
  player_name?: string;
  stat_type: StatType;
  period: number;
  value: number;
  timestamp: string;
}

/**
 * Stat type enum
 */
export type StatType = string | 'goals' | 'assists' | 'points' | 'plus_minus' | 'shots' | 'hits' | 'blocks' | 'takeaways' | 'giveaways' | 'faceoffs_won' | 'faceoffs_taken' | 'faceoff_pct';

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
 * Lines type
 */
export interface Lines {
  forwards: ForwardLine[];
  defense: DefensePair[];
  goalies: (User | null)[];
}
