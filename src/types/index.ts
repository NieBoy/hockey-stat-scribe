
// User Types
export type UserRole = 'player' | 'parent' | 'coach' | 'admin';

export interface Organization {
  id: string;
  name: string;
  teams: Team[];
  admins: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole[];  // Multiple roles are now possible
  organizations?: Organization[];
  teams?: Team[];
  children?: User[]; // For parents to link to player accounts
  stats?: PlayerStat[];
  isAdmin?: boolean;  // Quick check if user has admin role
}

// Team Types
export interface Team {
  id: string;
  name: string;
  logo?: string;
  organizationId: string;
  players: User[];
  coaches: User[];
  parents: User[];  // Parents associated with the team
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
  organizationId?: string;
  teamId?: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}
