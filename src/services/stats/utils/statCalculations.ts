
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
    
    currentStat.value += stat.value;
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
