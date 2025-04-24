
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "./statsUpdates";

/**
 * Refreshes stats for all players in the system
 * @returns Promise<void>
 */
export const refreshAllPlayerStats = async (): Promise<void> => {
  try {
    console.log("Starting to refresh all player stats");
    
    // Get all team members who should have stats
    // Important: We're using team_members.id as the consistent player identifier
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('id, name')
      .order('name');
      
    if (membersError) {
      console.error("Error fetching team members:", membersError);
      throw membersError;
    }
    
    const players = teamMembers || [];
    console.log(`Found ${players.length} players to refresh stats for`);
    
    // Process players in batches to avoid overwhelming the database
    const batchSize = 5;
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (player) => {
          try {
            console.log(`Refreshing stats for player: ${player.name} (team_member.id: ${player.id})`);
            await refreshPlayerStats(player.id);
            console.log(`Completed stats refresh for ${player.name}`);
          } catch (error) {
            console.error(`Error refreshing stats for ${player.name}:`, error);
          }
        })
      );
    }
    
    console.log("Successfully refreshed stats for all players");
  } catch (error) {
    console.error("Error in refreshAllPlayerStats:", error);
    throw error;
  }
};

/**
 * Reprocesses all player stats by clearing existing stats and regenerating them
 * @returns Promise<boolean> Success status
 */
export const reprocessAllStats = async (): Promise<boolean> => {
  try {
    console.log("Starting complete stats reprocessing");
    
    // Clear existing player stats
    const { error: clearError } = await supabase
      .from('player_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (clearError) {
      console.error("Error clearing player stats:", clearError);
      return false;
    }
    
    console.log("Existing player stats cleared. Starting refresh process...");
    
    // Refresh all player stats
    await refreshAllPlayerStats();
    console.log("Successfully reprocessed all player stats");
    return true;
  } catch (error) {
    console.error("Error in reprocessAllStats:", error);
    return false;
  }
};
