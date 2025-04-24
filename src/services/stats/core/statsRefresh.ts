
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "./statsUpdates";
import { createGameStatsFromEvents } from "./gameEventProcessor";
import { PlayerStat } from "@/types";

/**
 * Refreshes stats for all players
 * @returns Promise<boolean> Success status
 */
export const refreshAllPlayerStats = async (): Promise<boolean> => {
  try {
    console.log("Refreshing all player stats");
    
    // Get all team members
    const { data: players, error: playersError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('role', 'player');
      
    if (playersError) {
      console.error("Error fetching players:", playersError);
      return false;
    }
    
    console.log(`Found ${players?.length || 0} players for stats refresh`);
    
    if (!players || players.length === 0) {
      console.log("No players found to refresh stats");
      return false;
    }
    
    // Process each player in batches to avoid overwhelming the database
    const batchSize = 5;
    const results: boolean[] = [];
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} with ${batch.length} players`);
      
      // Process players in parallel within each batch
      const batchResults = await Promise.allSettled(
        batch.map(async (player) => {
          try {
            console.log(`Refreshing stats for player ${player.name} (${player.id})`);
            await refreshPlayerStats(player.id);
            return true;
          } catch (error) {
            console.error(`Error refreshing stats for player ${player.name}:`, error);
            return false;
          }
        })
      );
      
      // Collect results
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : false
      ));
    }
    
    // Count successful refreshes
    const successCount = results.filter(Boolean).length;
    console.log(`Successfully refreshed stats for ${successCount} out of ${players.length} players`);
    
    return successCount > 0;
  } catch (error) {
    console.error("Error in refreshAllPlayerStats:", error);
    return false;
  }
};

/**
 * Reprocesses all stats from game events for all players
 * @returns Promise<boolean> Success status
 */
export const reprocessAllStats = async (): Promise<boolean> => {
  try {
    console.log("Reprocessing all stats from game events");
    
    // Get all team members who are players
    const { data: players, error: playersError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('role', 'player');
      
    if (playersError) {
      console.error("Error fetching players:", playersError);
      return false;
    }
    
    if (!players || players.length === 0) {
      console.log("No players found");
      return false;
    }
    
    console.log(`Found ${players.length} players for reprocessing`);
    
    let successCount = 0;
    let totalPlayerCount = players.length;
    
    // Process each player in batches
    const batchSize = 3; // Smaller batch size for more intensive processing
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(players.length / batchSize)}`);
      
      await Promise.all(batch.map(async (player) => {
        try {
          console.log(`Reprocessing stats for player ${player.name} (${player.id})`);
          
          // Fetch all events where this player appears
          const { data: events, error: eventsError } = await supabase
            .from('game_events')
            .select('*');
          
          if (eventsError) {
            console.error(`Error fetching events for player ${player.id}:`, eventsError);
            return;
          }
          
          if (!events || events.length === 0) {
            console.log(`No events found for player ${player.id}`);
            return;
          }
          
          // Clear existing game_stats for this player
          const { error: deleteError } = await supabase
            .from('game_stats')
            .delete()
            .eq('player_id', player.id);
            
          if (deleteError) {
            console.error(`Error clearing existing stats for player ${player.id}:`, deleteError);
            return;
          }
          
          console.log(`Processing ${events.length} events for player ${player.id}`);
          
          // Process all events for this player
          const success = await createGameStatsFromEvents(player.id, events);
          
          // Call the refresh function to update aggregated stats
          if (success) {
            await refreshPlayerStats(player.id);
            successCount++;
          }
        } catch (error) {
          console.error(`Error reprocessing stats for player ${player.id}:`, error);
        }
      }));
    }
    
    console.log(`Successfully reprocessed stats for ${successCount} out of ${totalPlayerCount} players`);
    return successCount > 0;
  } catch (error) {
    console.error("Error in reprocessAllStats:", error);
    return false;
  }
};
