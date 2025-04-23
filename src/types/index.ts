
export type TeamBasic = {
  id: string;
  name: string;
};

export type Player = {
  id: string;
  name: string;
  position?: string;
  number?: string;
  teams?: TeamBasic[];
};

// Position type definition
export type Position = 'LW' | 'C' | 'RW' | 'LD' | 'RD' | 'G';

export type User = {
  id: string;
  name: string;
  email?: string;
  role?: UserRole[];
  position?: string;
  number?: string;
  teams?: TeamBasic[];
  children?: User[];
  isAdmin?: boolean; // Add isAdmin property
};

export type UserRole = 'admin' | 'coach' | 'parent' | 'player';

export type Team = TeamBasic & {
  players: Player[];
  coaches?: User[];
  parents?: User[]; // Add parents property
  lines?: Lines; // Add lines property
};

// Define Lines type
export type Lines = {
  forwards: ForwardLine[];
  defense: DefensePair[];
  goalies: User[];
  specialTeams?: {
    powerPlay: Record<string, User | null>;
    penaltyKill: Record<string, User | null>;
  };
};

export type ForwardLine = {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
};

// Rename to match actual usage
export type DefensePair = {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
};

// Alias for DefensePair to match imports
export type DefenseLine = DefensePair;

export type Game = {
  id: string;
  date: string;
  location: string;
  periods: number;
  current_period: number;
  is_active: boolean;
  isActive?: boolean; // Alias for is_active for compatibility
  homeTeam: Team;
  awayTeam: Team | null;
  opponent_name?: string;
  statTrackers?: StatTracker[];
};

export type StatTracker = {
  user: User;
  statTypes: string[];
};

export type GameEventType = 
  | 'goal'
  | 'penalty'
  | 'faceoff'
  | 'shot'
  | 'hit'
  | 'hits'
  | 'stoppage'
  | 'period-end'
  | 'period-start';

export type StatType = 
  | 'goals'
  | 'assists' 
  | 'plusMinus' 
  | 'savesAgainst' 
  | 'penalties'
  | 'pim'
  | 'faceoffs'
  | 'hits'
  | 'saves';

export type TeamType = 'home' | 'away';

export type GameEvent = {
  id: string;
  game_id: string;
  gameId?: string; // Alias for game_id
  event_type: GameEventType;
  period: number;
  team_type: TeamType;
  timestamp: string;
  details?: any;
};

export type GameStat = {
  id: string;
  game_id: string;
  gameId?: string; // Alias for game_id for compatibility
  player_id: string;
  playerId?: string; // Alias for player_id for compatibility
  stat_type: StatType;
  statType?: StatType; // Alias for stat_type for compatibility
  period: number;
  value: number;
  details?: string;
  timestamp: string;
};

export type PlayerStat = {
  id?: string;
  playerId: string;
  playerName?: string;
  statType: StatType;
  value: number;
  gamesPlayed: number;
  details?: string;
};

export type Invitation = {
  id: string;
  email: string;
  team_id?: string;
  teamId?: string; // Alias for team_id
  team_name?: string;
  role: UserRole;
  created_at: string;
  createdAt?: string; // Alias for created_at
  expires_at?: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy?: string;
};

// Add GameFormState type
export type GameFormState = {
  homeTeamId: string;
  awayTeamId: string | null;
  opponentName: string;
  date: Date;
  time: string;
  location: string;
  periods: number;
};
