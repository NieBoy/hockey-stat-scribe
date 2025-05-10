
/**
 * Player stat
 */
export interface PlayerStat {
  id: string;
  player_id: string;
  stat_type: string;
  value: number;
  games_played: number;
  playerName?: string;
  // Add alias properties to accommodate both naming conventions
  statType?: string;
  playerId?: string;
  gamesPlayed?: number;
}
