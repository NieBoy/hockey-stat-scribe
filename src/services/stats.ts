
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('id, player_id, stat_type, value, games_played');

    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(stat => ({
      playerId: stat.player_id,
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
};

export const getStatsByPlayerId = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('id, player_id, stat_type, value, games_played')
      .eq('player_id', playerId);

    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(stat => ({
      playerId: stat.player_id,
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error("Error fetching stats for player:", error);
    return [];
  }
};
