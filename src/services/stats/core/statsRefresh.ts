
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "./statsUpdates";

export const refreshAllPlayerStats = async (): Promise<void> => {
  try {
    const { data: gameStats, error: statsError } = await supabase
      .from('game_stats')
      .select('player_id');
      
    if (statsError) throw statsError;
    
    const uniquePlayerIds = [...new Set(gameStats?.map(stat => stat.player_id) || [])];
    
    console.log(`Found ${uniquePlayerIds.length} players with game stats`);
    
    for (const playerId of uniquePlayerIds) {
      await refreshPlayerStats(playerId);
    }
    
    console.log("Successfully refreshed stats for all players");
  } catch (error) {
    console.error("Error refreshing all player stats:", error);
    throw error;
  }
};
