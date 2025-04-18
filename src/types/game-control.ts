
export type GameStopReason = 'period-end' | 'stoppage' | null;
export type GameStatus = 'not-started' | 'in-progress' | 'stopped' | 'ended';
export type TeamType = 'home' | 'away';

export interface GameControlState {
  status: GameStatus;
  stopReason: GameStopReason;
}
