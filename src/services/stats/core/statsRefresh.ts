
import { supabase } from "@/lib/supabase";
import { createGameStatsFromEvents } from "./gameEventProcessor";

/**
 * Refreshes player stats for one or all players
 * @param playerIdOrAll The team_member.id of the player or 'all' for all players
 * @returns Promise<Record<string, string>> Status by player ID
 */
export const refreshPlayerStats = async (playerIdOrAll: string): Promise<Record<string, string>> => {
  const refreshStatus: Record<string, string> = {};
  
  try {
    console.log(`Starting refresh for: ${playerIdOrAll}`);
    
    if (playerIdOrAll === 'all') {
      // Refresh for all team members (players)
      const { data: players, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('role', 'player');
        
      if (error) throw error;
      
      const promises = players.map(async (player) => {
        try {
          refreshStatus[player.id] = "Processing";
          await supabase.rpc('refresh_player_stats', { player_id: player.id });
          refreshStatus[player.id] = "Success";
          return true;
        } catch (playerError) {
          console.error(`Error refreshing stats for player ${player.id}:`, playerError);
          refreshStatus[player.id] = "Failed";
          return false;
        }
      });
      
      await Promise.all(promises);
    } else {
      // Refresh for a specific player
      refreshStatus[playerIdOrAll] = "Processing";
      try {
        await supabase.rpc('refresh_player_stats', { player_id: playerIdOrAll });
        refreshStatus[playerIdOrAll] = "Success";
      } catch (playerError) {
        console.error(`Error refreshing stats for player ${playerIdOrAll}:`, playerError);
        refreshStatus[playerIdOrAll] = "Failed";
      }
    }
    
    return refreshStatus;
  } catch (error) {
    console.error(`Error in refreshPlayerStats:`, error);
    throw error;
  }
};

/**
 * Reprocesses all player stats from game events
 * This is a more intensive operation that recreates all stats from source events
 * @returns Promise<boolean> Success status
 */
export const reprocessAllStats = async (): Promise<boolean> => {
  const refreshStatus: Record<string, string> = {};
  
  try {
    console.log(`Starting full stats reprocessing`);
    
    // Step 1: Get all team members who are players
    const { data: players, error: playersError } = await supabase
      .from('team_members')
      .select('id, team_id')
      .eq('role', 'player');
      
    if (playersError) throw playersError;
    console.log(`Found ${players.length} players to process`);
    
    // Step 2: For each player, reprocess all their stats from game events
    for (const player of players) {
      try {
        refreshStatus[player.id] = "Processing";
        
        // Process events for this player
        console.log(`Reprocessing events for player ${player.id}`);
        
        // First, clear existing plus/minus stats to prevent duplication
        const { error: deleteError } = await supabase
          .from('game_stats')
          .delete()
          .eq('player_id', player.id)
          .eq('stat_type', 'plusMinus');
          
        if (deleteError) {
          console.error(`Error deleting plus/minus stats for player ${player.id}:`, deleteError);
        } else {
          console.log(`Successfully cleared existing plus/minus stats for player ${player.id}`);
        }
        
        // Process all events to recreate stats
        await createGameStatsFromEvents(player.id);
        
        // Refresh aggregated stats
        await supabase.rpc('refresh_player_stats', { player_id: player.id });
        
        refreshStatus[player.id] = "Success";
      } catch (playerError) {
        console.error(`Error reprocessing stats for player ${player.id}:`, playerError);
        refreshStatus[player.id] = "Failed";
      }
    }
    
    console.log(`Reprocessing completed with status:`, refreshStatus);
    return true;
  } catch (error) {
    console.error(`Error in reprocessAllStats:`, error);
    return false;
  }
};
