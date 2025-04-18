
export type GameStopReason = 'period-end' | 'stoppage' | null;
export type GameStatus = 'not-started' | 'in-progress' | 'stopped' | 'ended';

export interface GameControlState {
  status: GameStatus;
  stopReason: GameStopReason;
}
