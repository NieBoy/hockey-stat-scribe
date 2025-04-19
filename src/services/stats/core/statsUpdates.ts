
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { createGameStatsFromEvents } from "./gameEventProcessor";
import { updateOrInsertStat } from "./playerStatsDb";
import { calculateStatsSummary, createPlayerStatsFromSummary } from "../utils/statCalculations";

export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("refreshPlayerStats called for player:", playerId);
  try {
    // Get player details
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('name, team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    const playerName = playerData?.name || 'Unknown Player';
    console.log("Found player:", playerName, "team_id:", playerData.team_id);
    
    // Get relevant game events with correctly formatted query for JSON fields
    const { data: gameEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type')
      .or(`details->>'playerId'=.${playerId},details->>'primaryAssistId'=.${playerId},details->>'secondaryAssistId'=.${playerId},details->'playersOnIce'::jsonb?.'${playerId}'`);
      
    if (eventsError) {
      console.error("Error fetching game events:", eventsError);
    }
    
    console.log(`Found ${gameEvents?.length || 0} game events referencing player ${playerId}`);
    
    // Process events into game stats if needed
    if (gameEvents?.length > 0) {
      // First check if we have any existing stats
      const { data: existingStats, error: existingStatsError } = await supabase
        .from('game_stats')
        .select('count')
        .eq('player_id', playerId)
        .single();
        
      if (existingStatsError || !existingStats?.count) {
        console.log("No existing game stats found, creating from events...");
        await createGameStatsFromEvents(playerId, gameEvents);
      }
    }
    
    // Get all game stats
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('stat_type, value, game_id, period, details')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    if (!gameStats?.length) {
      console.log("No game stats found after processing events");
      return [];
    }
    
    // Calculate stats summary and create player stats
    const statsSummary = calculateStatsSummary(gameStats);
    const playerStats = createPlayerStatsFromSummary(playerId, playerName, statsSummary);
    
    // Update or insert each stat
    const results = await Promise.all(
      playerStats.map(async (stat) => {
        const updated = await updateOrInsertStat(playerId, stat);
        return updated ? stat : null;
      })
    );
    
    return results.filter((stat): stat is PlayerStat => stat !== null);
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
