
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
      if (stat.details === 'plus') {
        currentStat.value += stat.value; // Add for 'plus' events
      } else if (stat.details === 'minus') {
        currentStat.value -= stat.value; // Subtract for 'minus' events
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
      if (stat.details === 'plus') {
        total += stat.value;
      } else if (stat.details === 'minus') {
        total -= stat.value;
      }
    } else {
      total += stat.value;
    }
  });
  
  return total;
};
