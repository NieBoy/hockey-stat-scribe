
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

/**
 * Fetches player stats for a specific player
 * @param playerId The team_member.id of the player
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    console.log(`Fetching stats for player_id: ${playerId}`);
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

/**
 * Fetches stats for all players
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchAllPlayerStats = async (): Promise<PlayerStat[]> => {
  try {
    console.log(`Fetching stats for all players`);
    const { data, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        team_members!player_stats_player_id_fkey (
          name,
          role,
          team_id
        )
      `);
      
    if (error) throw error;
    
    return (data || []).map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      playerName: stat.team_members?.name,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error(`Error fetching all player stats:`, error);
    throw error;
  }
};
