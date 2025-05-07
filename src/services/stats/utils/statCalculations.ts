
import { PlayerStat, StatType } from "@/types";

export const calculateStatsSummary = (gameStats: any[]) => {
  const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
  gameStats.forEach(stat => {
    const statType = stat.stat_type;
    if (!statType) {
      console.warn("Ignoring stat with undefined stat_type:", stat);
      return;
    }
    
    const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
    
    // Simply add the numeric value for all stats including plusMinus
    const numericValue = Number(stat.value);
    currentStat.value += numericValue;
    
    if (statType === 'plusMinus') {
      console.log(`Adding ${numericValue} to plusMinus total (now ${currentStat.value})`);
    }
    
    currentStat.games.add(stat.game_id);
    
    statsSummary.set(statType, currentStat);
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
    
    // Add the numeric value directly
    total += numericValue;
    
    if (statType === 'plusMinus') {
      console.log(`[Aggregate] Adding ${numericValue} to plusMinus total (now ${total})`);
    }
  });
  
  return total;
};
