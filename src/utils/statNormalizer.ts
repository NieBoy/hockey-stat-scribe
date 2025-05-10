
import { GameStat, PlayerStat } from '@/types';

/**
 * Normalizes GameStat objects to ensure both snake_case and camelCase properties are available
 */
export function normalizeGameStat(stat: GameStat): GameStat {
  return {
    ...stat,
    gameId: stat.gameId || stat.game_id,
    game_id: stat.game_id || stat.gameId || '',
    playerId: stat.playerId || stat.player_id,
    player_id: stat.player_id || stat.playerId || '',
    statType: stat.statType || stat.stat_type,
    stat_type: stat.stat_type || stat.statType || '',
    details: stat.details || ''
  };
}

/**
 * Normalizes PlayerStat objects to ensure both snake_case and camelCase properties are available
 */
export function normalizePlayerStat(stat: Partial<PlayerStat>): PlayerStat {
  return {
    id: stat.id || '',
    player_id: stat.player_id || stat.playerId || '',
    stat_type: stat.stat_type || stat.statType || '',
    value: stat.value || 0,
    games_played: stat.games_played || stat.gamesPlayed || 0,
    playerId: stat.playerId || stat.player_id || '',
    statType: stat.statType || stat.stat_type || '',
    gamesPlayed: stat.gamesPlayed || stat.games_played || 0,
    playerName: stat.playerName || '',
    details: stat.details || ''
  };
}

/**
 * Normalizes an array of GameStat objects
 */
export function normalizeGameStats(stats: GameStat[]): GameStat[] {
  return stats.map(normalizeGameStat);
}

/**
 * Normalizes an array of PlayerStat objects
 */
export function normalizePlayerStats(stats: Partial<PlayerStat>[]): PlayerStat[] {
  return stats.map(normalizePlayerStat);
}
