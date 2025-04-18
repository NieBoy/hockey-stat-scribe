// User Types
export type UserRole = 'player' | 'parent' | 'coach' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;  // Made optional
  role: UserRole[];  // Multiple roles are now possible
  teams?: Team[];  // Added this line
  children?: User[]; // For parents to link to player accounts
  stats?: PlayerStat[];
  isAdmin?: boolean;  // Quick check if user has admin role
  position?: Position;
  lineNumber?: number;
  number?: string;    // New field for player number
  description?: string; // New field for player description
  profileImage?: string; // New field for profile image
}

// Team Types
export interface Team {
  id: string;
  name: string;
  logo?: string;
  players: User[];
  coaches: User[];
  parents: User[];  // Parents associated with the team
  games?: Game[];
  lines?: Lines;
}

// Hockey position types
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G' | 'LF' | 'RF' | null;

export interface PlayerPosition {
  playerId: string;
  position: Position;
  lineNumber: number;
}

export interface Lines {
  forwards: ForwardLine[];
  defense: DefenseLine[];
  goalies: User[];
  specialTeams?: {
    powerPlay?: Record<string, User | null>;
    penaltyKill?: Record<string, User | null>;
  };
}

export interface ForwardLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
}

export interface DefenseLine {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
}

export interface PowerPlayLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
  leftDefense: User | null;
  rightDefense: User | null;
}

export interface PenaltyKillLine {
  lineNumber: number;
  leftForward: User | null;
  rightForward: User | null;
  leftDefense: User | null;
  rightDefense: User | null;
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
export type StatType = 'goals' | 'assists' | 'faceoffs' | 'hits' | 'penalties' | 'saves' | 'plusMinus';

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

// User Relationship Types
export interface UserRelationship {
  id: string;
  parentId: string;
  childId: string;
}

// Invitation Types
export interface Invitation {
  id: string;
  email: string;
  role: UserRole[];
  teamId?: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt?: Date;
}
