
export type GameStatus = 'not-started' | 'in-progress' | 'stopped' | 'completed';
export type GameStopReason = 'period-end' | 'timeout' | 'penalty' | 'injury' | 'other' | null;
export type TeamType = 'home' | 'away';

export interface GameControlState {
  status: GameStatus;
  period: number;
  stopReason: GameStopReason;
  isActive: boolean;
}
