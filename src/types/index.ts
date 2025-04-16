
// User Types
export type UserRole = 'player' | 'parent' | 'coach';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teams?: Team[];
  children?: User[]; // For parents to link to player accounts
  stats?: PlayerStat[];
}

// Team Types
export interface Team {
  id: string;
  name: string;
  logo?: string;
  players: User[];
  coaches: User[];
  games?: Game[];
}

// Game Types
export interface Game {
  id: string;
  date: Date;
  homeTeam: Team;
  awayTeam: Team;
  location: string;
  statTrackers: StatTracker[];
  periods: number;
  currentPeriod: number;
  isActive: boolean;
  stats: GameStat[];
}

export interface StatTracker {
  user: User;
  statTypes: StatType[];
}

// Stat Types
export type StatType = 'goals' | 'assists' | 'faceoffs' | 'hits' | 'penalties' | 'saves';

export interface GameStat {
  id: string;
  gameId: string;
  playerId: string;
  statType: StatType;
  period: number;
  timestamp: Date;
  value: number;
  details?: string;
}

export interface PlayerStat {
  playerId: string;
  statType: StatType;
  value: number;
  gamesPlayed: number;
}

// Form States
export interface GameFormState {
  date: Date;
  homeTeam: string;
  awayTeam: string;
  location: string;
  periods: number;
}
