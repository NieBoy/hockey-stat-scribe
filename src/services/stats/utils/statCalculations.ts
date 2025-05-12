
import { PlayerStat, StatType } from "@/types";

export const calculateStatsSummary = (gameStats: any[]) => {
  const statsSummary = new Map<string, { value: number, games: Set<string> }>();
  
  console.log(`Calculating stats summary from ${gameStats.length} game stats`);
    
  gameStats.forEach(stat => {
    const statType = stat.stat_type;
    if (!statType) {
      console.warn("Ignoring stat with undefined stat_type:", stat);
      return;
    }
    
    const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
    
    // Ensure we're working with a numeric value
    const numericValue = Number(stat.value);
    
    if (isNaN(numericValue)) {
      console.warn(`Invalid numeric value for stat ${statType}:`, stat.value);
      return;
    }
    
    currentStat.value += numericValue;
    
    if (statType === 'plusMinus') {
      console.log(`Adding ${numericValue} to plusMinus total (now ${currentStat.value}) from game ${stat.game_id}`);
    }
    
    currentStat.games.add(stat.game_id);
    
    statsSummary.set(statType, currentStat);
  });

  // Log the final summary for debugging
  console.log("Final stats summary:");
  statsSummary.forEach((value, key) => {
    console.log(`${key}: ${value.value} (${value.games.size} games)`);
  });

  return statsSummary;
};

export const createPlayerStatsFromSummary = (
  playerId: string,
  playerName: string,
  statsSummary: Map<string, { value: number, games: Set<string> }>
): PlayerStat[] => {
  return Array.from(statsSummary.entries()).map(([statType, data]) => ({
    id: `stat-${playerId}-${statType}`, // Generated temporary ID
    playerId,
    player_id: playerId,
    statType: statType as StatType,
    stat_type: statType,
    value: data.value,
    gamesPlayed: data.games.size,
    games_played: data.games.size,
    playerName
  }));
};

/**
 * Calculate the aggregate value of a specific stat type from raw game stats
 * @param gameStats Array of raw game stats
 * @param statType The stat type to aggregate
 * @returns number The aggregated value
 */
export const calculateAggregateValue = (gameStats: any[], statType: string): number => {
  let total = 0;
  
  gameStats.forEach(stat => {
    if (stat.stat_type !== statType) return;
    
    // Ensure we're working with a numeric value
    const numericValue = Number(stat.value);
    
    if (isNaN(numericValue)) {
      console.warn(`Invalid numeric value for ${statType}:`, stat.value);
      return;
    }
    
    // Add the numeric value directly
    total += numericValue;
    
    if (statType === 'plusMinus') {
      console.log(`[Aggregate] Adding ${numericValue} to plusMinus total (now ${total})`);
    }
  });
  
  return total;
};
