
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

export type Team = TeamBasic & {
  players: Player[];
};

export type Game = {
  id: string;
  date: string;
  location: string;
  periods: number;
  current_period: number;
  is_active: boolean;
  homeTeam: Team;
  awayTeam: Team | null;
  opponent_name?: string;
};

export type GameEventType = 
  | 'goal'
  | 'penalty'
  | 'faceoff'
  | 'shot'
  | 'hit'
  | 'stoppage'
  | 'period-end'
  | 'period-start';

export type StatType = 
  | 'goals'
  | 'assists' 
  | 'plusMinus' 
  | 'savesAgainst' 
  | 'penalties'
  | 'pim';

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
  player_id: string;
  stat_type: StatType;
  period: number;
  value: number;
  details?: string;
  timestamp: string;
};
