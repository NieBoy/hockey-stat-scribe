
import { Player, PlayerStat, StatType } from "@/types";

interface TransformedPlayerStats {
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  stats: Record<StatType, number>;
}

export function useTransformedTeamStats(stats: PlayerStat[], teamPlayers: Player[] = []) {
  // Get unique stat types from all stats
  const statTypes = [...new Set(stats.map(stat => stat.statType))] as StatType[];

  // First, create entries for all players on the team
  const playerStats: Record<string, TransformedPlayerStats> = {};

  // Initialize with all team players, even if they have no stats
  teamPlayers.forEach(player => {
    playerStats[player.id] = {
      playerId: player.id,
      playerName: player.name || 'Unknown Player',
      gamesPlayed: 0,
      stats: {} as Record<StatType, number>
    };
  });

  // Then add stats for players that have them
  stats.forEach(stat => {
    if (!playerStats[stat.playerId]) {
      // If player wasn't in the team list (fallback)
      playerStats[stat.playerId] = {
        playerId: stat.playerId,
        playerName: stat.playerName || 'Unknown Player',
        gamesPlayed: stat.gamesPlayed || 0,
        stats: {} as Record<StatType, number>
      };
    } else {
      // Update games played for existing players
      playerStats[stat.playerId].gamesPlayed = Math.max(
        playerStats[stat.playerId].gamesPlayed,
        stat.gamesPlayed || 0
      );
    }

    // Add the specific stat
    playerStats[stat.playerId].stats[stat.statType as StatType] = stat.value;
  });

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
