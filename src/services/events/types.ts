// Existing goal types
export interface GoalEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  scorerId?: string;
  primaryAssistId?: string;
  secondaryAssistId?: string;
  playersOnIce: string[];
}

// New types for other events
export interface HitEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
}

export interface ShotEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  isForUs: boolean;
}

export interface FaceoffEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  isWon: boolean;
}

export interface PenaltyEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  penaltyType: string;
  duration: 'minor' | 'major';
  additionalPenalty: 'none' | 'match' | 'game-misconduct';
}
