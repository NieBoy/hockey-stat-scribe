
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
    console.log("Found player:", playerName);
    
    // Fetch game events with improved query
    const { data: gameEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('*')
      .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`)
      .contains('details', { playersOnIce: [playerId] });
      
    if (eventsError) {
      console.error("Error fetching game events:", eventsError);
      throw eventsError;
    }
    
    console.log(`Found ${gameEvents?.length || 0} game events for player ${playerId}`);
    
    // Process events into game stats
    if (gameEvents && gameEvents.length > 0) {
      const statsCreated = await createGameStatsFromEvents(playerId, gameEvents);
      console.log(`Game stats creation result: ${statsCreated}`);
    }
    
    // Get all game stats after processing
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    console.log(`Found ${gameStats?.length || 0} game stats after processing`);
    
    // Calculate and update player stats
    const statsSummary = calculateStatsSummary(gameStats || []);
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
