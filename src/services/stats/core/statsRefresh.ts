
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "./statsUpdates";

export const refreshAllPlayerStats = async (): Promise<void> => {
  try {
    console.log("Starting to refresh all player stats");
    
    // Get all team members who should have stats
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
    
    // Refresh stats for each player - using team_member.id
    for (const player of players) {
      console.log(`Refreshing stats for player: ${player.name} (${player.id})`);
      try {
        await refreshPlayerStats(player.id);
        console.log(`Completed stats refresh for ${player.name}`);
      } catch (error) {
        console.error(`Error refreshing stats for ${player.name}:`, error);
        // Continue with next player rather than breaking the entire process
      }
    }
    
    console.log("Successfully refreshed stats for all players");
  } catch (error) {
    console.error("Error in refreshAllPlayerStats:", error);
    throw error;
  }
};

// Function to call the database function to reprocess all stats from events
export const reprocessAllStats = async (): Promise<boolean> => {
  try {
    console.log("Calling database function to reprocess all stats");
    
    const { data, error } = await supabase
      .rpc('reprocess_all_player_stats');
      
    if (error) {
      console.error("Error reprocessing all stats:", error);
      throw error;
    }
    
    console.log("Successfully reprocessed all stats");
    return true;
  } catch (error) {
    console.error("Error in reprocessAllStats:", error);
    return false;
  }
};
