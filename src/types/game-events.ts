
import { GameEvent } from "./index";

export type GameEventType = 'goal' | 'penalty' | 'faceoff' | 'shot' | 'hit';

export interface GameEventPlayer {
  event_id: string;
  player_id: string;
  role: string;
  is_opponent?: boolean;
  jersey_number?: string;
}

export interface GameEventDetails {
  scoreChange?: boolean;
  penaltyMinutes?: number;
  penaltyType?: string;
  shotType?: string;
  wasGoal?: boolean;
  isBlocked?: boolean;
  hitType?: string;
  hitStrength?: 'light' | 'medium' | 'hard';
  faceoffLocation?: string;
  winnerId?: string;
  loserId?: string;
}

// Re-export the GameEvent type with the proper syntax for isolatedModules
export type { GameEvent };
