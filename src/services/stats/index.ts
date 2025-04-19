
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

/**
 * Gets all player stats
 */
export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        team_members:player_id(name)
      `)
      .order('value', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(stat => ({
      playerId: stat.player_id,
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played,
      playerName: stat.team_members ? (stat.team_members as any).name : 'Unknown Player'
    })) || [];
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
};
