
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { validateMultiplePlayers } from "@/services/events/shared/validatePlayer";

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
      .select('id, name, team_id')
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
    
    const playerName = playerData.name || 'Unknown Player';
    console.log("Found player:", playerName, "with team_member ID:", playerId);
    
    // Query for goal-related events using correct JSONB syntax
    console.log("Fetching goal events for player:", playerId);
    const { data: goalEvents, error: goalError } = await supabase
      .from('game_events')
      .select('*')
      .eq('event_type', 'goal')
      .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`);
      
    if (goalError) {
      console.error("Error fetching goal events:", goalError);
      throw goalError;
    }
    
    console.log(`Found ${goalEvents?.length || 0} goal events for player ${playerId}`);
    
    // Query for on-ice events with correct JSONB array containment
    console.log("Fetching on-ice events for player:", playerId);
    const { data: onIceEvents, error: onIceError } = await supabase
      .from('game_events')
      .select('*')
      .contains('details', { playersOnIce: [playerId] });
      
    if (onIceError) {
      console.error("Error fetching on-ice events:", onIceError);
      throw onIceError;
    }
    
    console.log(`Found ${onIceEvents?.length || 0} on-ice events for player ${playerId}`);
    
    // Combine and deduplicate events
    const allEvents = [...(goalEvents || []), ...(onIceEvents || [])];
    const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());
    
    console.log(`Processing ${uniqueEvents.length} total unique events for player ${playerId}`);
    
    // Process events into game stats in batches
    if (uniqueEvents.length > 0) {
      console.log("Processing events in batches...");
      const batchSize = 5;
      for (let i = 0; i < uniqueEvents.length; i += batchSize) {
        const batch = uniqueEvents.slice(i, i + batchSize);
        await Promise.all(batch.map(async (event) => {
          try {
            const { details } = event;
            if (!details) return;
            
            // Extract player IDs for validation
            const playerIds = [
              details.playerId,
              details.primaryAssistId,
              details.secondaryAssistId,
              ...(details.playersOnIce || [])
            ].filter(Boolean);
            
            // Validate all player IDs before processing
            if (playerIds.length > 0) {
              const isValid = await validateMultiplePlayers(playerIds);
              if (!isValid) {
                console.error(`Invalid player IDs found in event ${event.id}`);
                return;
              }
            }
            
            // Call refresh_player_stats database function
            const { error: refreshError } = await supabase
              .rpc('refresh_player_stats', { player_id: playerId });
              
            if (refreshError) {
              console.error(`Error refreshing stats for event ${event.id}:`, refreshError);
            }
          } catch (error) {
            console.error(`Error processing event ${event.id}:`, error);
          }
        }));
      }
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
    
    console.log(`Retrieved ${playerStats?.length || 0} refreshed stats for player ${playerId}`);
    
    // Format the stats for return
    const formattedStats = playerStats?.map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      playerName: playerName,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played,
      details: ''
    })) || [];
    
    return formattedStats;
  } catch (error) {
    console.error("Error in refreshPlayerStats:", error);
    throw error;
  }
};
