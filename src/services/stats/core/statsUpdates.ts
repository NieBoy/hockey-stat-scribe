
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
      .select('id, name, team_id')
      .eq('id', playerId)
      .maybeSingle();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    if (!playerData) {
      console.error("Player not found with ID:", playerId);
      return [];
    }
    
    const playerName = playerData.name || 'Unknown Player';
    console.log("Found player:", playerName, "with team_member ID:", playerId);
    
    // Use two separate queries for better performance and clarity
    const { data: goalEvents, error: goalError } = await supabase
      .from('game_events')
      .select('*')
      .eq('event_type', 'goal')
      .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`);
      
    if (goalError) {
      console.error("Error fetching goal events:", goalError);
      throw goalError;
    }
    
    const { data: onIceEvents, error: onIceError } = await supabase
      .from('game_events')
      .select('*')
      .contains('details', { playersOnIce: [playerId] });
      
    if (onIceError) {
      console.error("Error fetching on-ice events:", onIceError);
      throw onIceError;
    }
    
    // Combine and deduplicate events
    const allEvents = [...(goalEvents || []), ...(onIceEvents || [])];
    const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());
    
    console.log(`Processing ${uniqueEvents.length} total events for player ${playerId}`);
    
    // Process events into game stats
    if (uniqueEvents.length > 0) {
      console.log("Creating game stats from events...");
      await createGameStatsFromEvents(playerId, uniqueEvents);
    }
    
    // Call the database refresh function
    const { data: refreshResult, error: refreshError } = await supabase
      .rpc('refresh_player_stats', { player_id: playerId });
      
    if (refreshError) {
      console.error("Error calling refresh_player_stats function:", refreshError);
      throw refreshError;
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
    
    return playerStats || [];
  } catch (error) {
    console.error("Error in refreshPlayerStats:", error);
    throw error;
  }
};

