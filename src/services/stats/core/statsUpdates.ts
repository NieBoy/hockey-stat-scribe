
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { createGameStatsFromEvents } from "./gameEventProcessor";
import { updateOrInsertStat } from "./playerStatsDb";
import { calculateStatsSummary, createPlayerStatsFromSummary } from "../utils/statCalculations";

export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("refreshPlayerStats called for player:", playerId);
  try {
    // Verify player exists in team_members
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name, team_id, user_id')
      .eq('id', playerId)
      .single();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    if (!playerData) {
      console.error("Player not found with ID:", playerId);
      return [];
    }
    
    // We use team_member.id consistently throughout the application
    const playerStatsId = playerData.id;
    const playerName = playerData.name || 'Unknown Player';
    
    console.log("Found player:", playerName, "with team_member ID:", playerStatsId);
    
    // Fetch game events with proper JSONB queries
    console.log("Fetching game events for player ID:", playerStatsId);
    
    // Query 1: Events where the player is directly mentioned in specific fields
    // Using proper JSONB path operators
    const { data: directEvents, error: directError } = await supabase
      .from('game_events')
      .select('*')
      .or(`details->>'playerId'.eq.${playerStatsId},details->>'primaryAssistId'.eq.${playerStatsId},details->>'secondaryAssistId'.eq.${playerStatsId}`);
      
    if (directError) {
      console.error("Error fetching direct game events:", directError);
      throw directError;
    }
    
    console.log(`Found ${directEvents?.length || 0} direct events for player ${playerStatsId}`);
    console.log("Sample direct event:", directEvents && directEvents.length > 0 ? directEvents[0] : "No events");
    
    // Query 2: Events where player is in playersOnIce array
    // Using contains operator for JSONB arrays
    const { data: onIceEvents, error: onIceError } = await supabase
      .from('game_events')
      .select('*')
      .contains('details', { playersOnIce: [playerStatsId] });
      
    if (onIceError) {
      console.error("Error fetching on-ice events:", onIceError);
      throw onIceError;
    }
    
    console.log(`Found ${onIceEvents?.length || 0} on-ice events for player ${playerStatsId}`);
    console.log("Sample on-ice event:", onIceEvents && onIceEvents.length > 0 ? onIceEvents[0] : "No events");
    
    // Combine events, removing duplicates
    const allEvents = [...(directEvents || []), ...(onIceEvents || [])];
    const uniqueEventIds = new Set();
    const gameEvents = allEvents.filter(event => {
      if (uniqueEventIds.has(event.id)) return false;
      uniqueEventIds.add(event.id);
      return true;
    });
    
    console.log(`Total unique game events for player ${playerStatsId}: ${gameEvents.length}`);
    
    // Process events into game stats - this is where events become statistics
    if (gameEvents && gameEvents.length > 0) {
      console.log(`Processing ${gameEvents.length} events into game stats...`);
      try {
        const statsCreated = await createGameStatsFromEvents(playerStatsId, gameEvents);
        console.log(`Game stats creation result: ${statsCreated ? 'Success' : 'No new stats created'}`);
      } catch (createStatsError) {
        console.error("Error creating game stats from events:", createStatsError);
        // Continue execution to at least try to summarize existing stats
      }
    } else {
      console.log("No events found to process for this player");
    }
    
    // Get all game stats after processing
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', playerStatsId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    console.log(`Found ${gameStats?.length || 0} game stats for player ${playerStatsId}`);
    
    // Calculate and update player stats
    const statsSummary = calculateStatsSummary(gameStats || []);
    const playerStats = createPlayerStatsFromSummary(playerStatsId, playerName, statsSummary);
    
    console.log("Generated player stats summary:", playerStats);
    
    // Update or insert each stat
    const results = await Promise.all(
      playerStats.map(async (stat) => {
        try {
          const updated = await updateOrInsertStat(playerStatsId, stat);
          return updated ? stat : null;
        } catch (error) {
          console.error(`Error updating stat ${stat.statType}:`, error);
          return null;
        }
      })
    );
    
    const validResults = results.filter((stat): stat is PlayerStat => stat !== null);
    console.log(`Successfully updated ${validResults.length} stats for player ${playerStatsId}`);
    
    return validResults;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
