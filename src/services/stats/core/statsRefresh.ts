
import { supabase } from "@/lib/supabase";
import { createGameStatsFromEvents } from "./gameEventProcessor";

/**
 * Reprocess all player stats from game events
 * @returns Promise<boolean> Success status
 */
export const reprocessAllStats = async (): Promise<boolean> => {
  try {
    console.log("Starting reprocessing of all player stats from game events");
    
    // Get all team members who have played in games
    const { data: playerIds, error: playerError } = await supabase
      .from('team_members')
      .select('id')
      .not('position', 'is', null); // Only include players with positions
    
    if (playerError) {
      console.error("Error fetching players for stat reprocessing:", playerError);
      return false;
    }
    
    if (!playerIds || playerIds.length === 0) {
      console.log("No players found for stat reprocessing");
      return false;
    }
    
    console.log(`Found ${playerIds.length} players to reprocess stats for`);
    
    // Get all game events
    const { data: gameEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('*');
    
    if (eventsError) {
      console.error("Error fetching game events for stat reprocessing:", eventsError);
      return false;
    }
    
    if (!gameEvents || gameEvents.length === 0) {
      console.log("No game events found for stat reprocessing");
      return false;
    }
    
    console.log(`Found ${gameEvents.length} game events to process`);
    
    // Process stats for each player
    const results = await Promise.allSettled(
      playerIds.map(async (player) => {
        try {
          console.log(`Processing stats for player ${player.id}`);
          const result = await createGameStatsFromEvents(player.id, gameEvents);
          return { playerId: player.id, success: result };
        } catch (error) {
          console.error(`Error processing stats for player ${player.id}:`, error);
          return { playerId: player.id, success: false, error };
        }
      })
    );
    
    // Count successful and failed operations
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    console.log(`Stats reprocessing complete: ${successful} players successful, ${failed} players failed`);
    
    // Refresh player_stats aggregated table
    for (const player of playerIds) {
      try {
        const { error } = await supabase.rpc('refresh_player_stats', { player_id: player.id });
        if (error) {
          console.error(`Error refreshing aggregated stats for player ${player.id}:`, error);
        }
      } catch (refreshError) {
        console.error(`Exception refreshing aggregated stats for player ${player.id}:`, refreshError);
      }
    }
    
    return successful > 0;
  } catch (error) {
    console.error("Error in reprocessAllStats:", error);
    return false;
  }
};

/**
 * Reprocess stats for a specific player from game events
 * @param playerId The team_member.id of the player
 * @returns Promise<boolean> Success status
 */
export const refreshPlayerStats = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Refreshing stats for player ${playerId}`);
    
    // Get all game events
    const { data: gameEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('*');
    
    if (eventsError) {
      console.error(`Error fetching game events for player ${playerId}:`, eventsError);
      return false;
    }
    
    // Process stats for this player
    const result = await createGameStatsFromEvents(playerId, gameEvents || []);
    
    if (result) {
      // Refresh aggregated stats
      const { error } = await supabase.rpc('refresh_player_stats', { player_id: playerId });
      if (error) {
        console.error(`Error refreshing aggregated stats for player ${playerId}:`, error);
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error refreshing stats for player ${playerId}:`, error);
    return false;
  }
};
