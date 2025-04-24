
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { refreshPlayerStats, reprocessAllStats } from "./core/statsRefresh";

/**
 * Fetches player stats for a specific player
 * @param playerId The team_member.id of the player
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) throw error;
    
    return (data || []).map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error(`Error fetching player stats:`, error);
    throw error;
  }
};

// Export the refresh functions
export { refreshPlayerStats, reprocessAllStats };
