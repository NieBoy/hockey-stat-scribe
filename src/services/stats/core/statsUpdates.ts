
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { validatePlayerId } from "@/services/events/shared/validatePlayer";

/**
 * Refreshes stats for a player by processing game events and updating database
 * @param playerId The team_member.id of the player to refresh stats for
 * @returns Promise<PlayerStat[]> The refreshed player stats
 */
export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("refreshPlayerStats called for team_member.id:", playerId);
  try {
    // Verify player exists in team_members
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('id', playerId)
      .maybeSingle();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    if (!playerData) {
      console.error("Player not found with team_member.id:", playerId);
      return [];
    }
    
    // Call refresh_player_stats database function
    const { error: refreshError } = await supabase
      .rpc('refresh_player_stats', { 
        player_id: playerId  // This now expects team_member.id
      });
      
    if (refreshError) {
      console.error("Error refreshing player stats:", refreshError);
      throw refreshError;
    }
    
    // Fetch the updated stats
    const { data: playerStats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (statsError) {
      console.error("Error fetching updated player stats:", statsError);
      throw statsError;
    }
    
    // Format the stats for return
    return playerStats.map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      playerName: playerData.name,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error("Error in refreshPlayerStats:", error);
    throw error;
  }
};
