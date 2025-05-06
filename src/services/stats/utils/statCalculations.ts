
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
    
    // Special handling for plus/minus
    if (statType === 'plusMinus') {
      const value = Number(stat.value);
      // 'plus' events add to the total, 'minus' events subtract
      if (stat.details === 'plus') {
        currentStat.value += value;
        console.log(`Adding +${value} for plus event to plusMinus total (now ${currentStat.value})`);
      } else if (stat.details === 'minus') {
        // Minus events should subtract from the total
        currentStat.value -= value; 
        console.log(`Subtracting ${value} for minus event from plusMinus total (now ${currentStat.value})`);
      }
    } else {
      currentStat.value += stat.value; // Normal addition for other stat types
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
    
    if (statType === 'plusMinus') {
      const value = Number(stat.value);
      // Handle plus/minus events properly
      if (stat.details === 'plus') {
        total += value;
        console.log(`[Aggregate] Adding +${value} for plus event to plusMinus total (now ${total})`);
      } else if (stat.details === 'minus') {
        total -= value;
        console.log(`[Aggregate] Subtracting ${value} for minus event from plusMinus total (now ${total})`);
      }
    } else {
      total += stat.value;
    }
  });
  
  return total;
};
