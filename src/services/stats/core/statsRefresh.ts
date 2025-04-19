
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "./statsUpdates";

export const refreshAllPlayerStats = async (): Promise<void> => {
  try {
    console.log("Starting to refresh all player stats");
    
    // Get all unique player IDs from game_stats
    const { data: gameStats, error: statsError } = await supabase
      .from('game_stats')
      .select('player_id');
      
    if (statsError) {
      console.error("Error fetching game stats for player IDs:", statsError);
      throw statsError;
    }
    
    const uniquePlayerIds = [...new Set(gameStats?.map(stat => stat.player_id) || [])];
    
    console.log(`Found ${uniquePlayerIds.length} players with game stats to refresh`);
    
    // Refresh stats for each player
    for (const playerId of uniquePlayerIds) {
      console.log(`Refreshing stats for player: ${playerId}`);
      await refreshPlayerStats(playerId);
    }
    
    console.log("Successfully refreshed stats for all players");
  } catch (error) {
    console.error("Error in refreshAllPlayerStats:", error);
    throw error;
  }
};
