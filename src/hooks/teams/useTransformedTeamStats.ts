
import { PlayerStat, StatType } from "@/types";

interface TransformedPlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  stats: Record<StatType, number>;
}

export function useTransformedTeamStats(stats: PlayerStat[]) {
  // Get unique stat types from all stats
  const statTypes = [...new Set(stats.map(stat => stat.statType))] as StatType[];

  // Group stats by player
  const playerStats = stats.reduce<Record<string, TransformedPlayerStats>>((acc, stat) => {
    if (!acc[stat.playerId]) {
      acc[stat.playerId] = {
        playerId: stat.playerId,
        playerName: stat.playerName || 'Unknown Player',
        gamesPlayed: stat.gamesPlayed || 0,
        stats: {} as Record<StatType, number>
      };
    }
    acc[stat.playerId].stats[stat.statType as StatType] = stat.value;
    return acc;
  }, {});

  // Convert to array and ensure all stat types exist (with 0 as default)
  const transformedStats = Object.values(playerStats).map(player => ({
    ...player,
    stats: statTypes.reduce((acc, type) => ({
      ...acc,
      [type]: player.stats[type] || 0
    }), {} as Record<StatType, number>)
  }));

  return { transformedStats, statTypes };
}
