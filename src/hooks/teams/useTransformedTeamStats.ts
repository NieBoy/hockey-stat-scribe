
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

  // Process stats for players - group by player first
  const statsByPlayer: Record<string, PlayerStat[]> = {};
  stats.forEach(stat => {
    if (!statsByPlayer[stat.playerId]) {
      statsByPlayer[stat.playerId] = [];
    }
    statsByPlayer[stat.playerId].push(stat);
  });

  // Process each player's stats
  Object.entries(statsByPlayer).forEach(([playerId, playerStats_]) => {
    if (!playerStats[playerId]) {
      // If player wasn't in the team list (fallback)
      playerStats[playerId] = {
        playerId: playerId,
        playerName: playerStats_[0]?.playerName || 'Unknown Player',
        gamesPlayed: playerStats_[0]?.gamesPlayed || 0,
        stats: {} as Record<StatType, number>
      };
    } else {
      // Update games played for existing players
      const maxGamesPlayed = Math.max(...playerStats_.map(s => s.gamesPlayed || 0));
      playerStats[playerId].gamesPlayed = Math.max(
        playerStats[playerId].gamesPlayed,
        maxGamesPlayed
      );
    }

    // Process each stat type separately
    statTypes.forEach(statType => {
      // Filter stats for this player and this stat type
      const relevantStats = playerStats_.filter(s => s.statType === statType);
      
      if (relevantStats.length === 0) {
        // No stats of this type
        playerStats[playerId].stats[statType] = 0;
        return;
      }
      
      // Sum up the values - now using the actual values that are stored in the database
      playerStats[playerId].stats[statType] = relevantStats.reduce(
        (sum, stat) => sum + Number(stat.value), 0
      );
    });
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
