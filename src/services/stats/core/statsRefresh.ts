
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
        
        // Get all events where this player was involved (team_id will help filter relevant games)
        const { data: games, error: gamesError } = await supabase
          .from('games')
          .select('id')
          .or(`home_team_id.eq.${player.team_id},away_team_id.eq.${player.team_id}`);
          
        if (gamesError) throw gamesError;
        
        // For each game, get all events
        const allEvents: any[] = [];
        for (const game of games) {
          const { data: events, error: eventsError } = await supabase
            .rpc('get_game_events', { p_game_id: game.id });
            
          if (eventsError) throw eventsError;
          if (events) allEvents.push(...events);
        }
        
        // Process events for this player
        console.log(`Processing ${allEvents.length} events for player ${player.id}`);
        await createGameStatsFromEvents(player.id, allEvents);
        
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
