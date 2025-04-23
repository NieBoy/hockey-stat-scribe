
export type TeamBasic = {
  id: string;
  name: string;
};

export type Player = {
  id: string;
  name: string;
  position?: string;
  number?: string;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  role?: string[];
  position?: string;
  number?: string;
  teams?: TeamBasic[];
  children?: User[];
};

export type UserRole = 'admin' | 'coach' | 'parent' | 'player';

export type Team = TeamBasic & {
  players: Player[];
  coaches?: User[];
  lines?: {
    forwards: ForwardLine[];
    defense: DefensePair[];
    goalies?: User[];
  };
};

export type ForwardLine = {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
};

export type DefensePair = {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
};

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
  team_id: string;
  team_name: string;
  role: UserRole;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined';
};
