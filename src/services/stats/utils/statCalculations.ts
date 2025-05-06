
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
    
    // Simply add the value, regardless of the stat type
    currentStat.value += Number(stat.value);
    
    if (statType === 'plusMinus') {
      console.log(`Adding ${stat.value} to plusMinus total (now ${currentStat.value})`);
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
): Partial<PlayerStat>[] => {
  return Array.from(statsSummary.entries()).map(([statType, data]) => ({
    playerId,
    statType: statType as StatType,
    value: data.value,
    gamesPlayed: data.games.size,
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
    
    // Simply add the value for all stat types including plusMinus
    total += Number(stat.value);
    
    if (statType === 'plusMinus') {
      console.log(`[Aggregate] Adding ${stat.value} to plusMinus total (now ${total})`);
    }
  });
  
  return total;
};
