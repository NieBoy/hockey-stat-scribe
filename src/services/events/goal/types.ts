
export interface GoalEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  scorerId?: string;
  primaryAssistId?: string;
  secondaryAssistId?: string;
  playersOnIce: string[];
}
