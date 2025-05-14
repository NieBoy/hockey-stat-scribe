
import { supabase } from '@/lib/supabase';
import { createGameStat } from './utils/statsDbUtils';
import type { GameEvent } from '@/types/game-events';
import { processGoalEvent } from './processors/goalProcessor';

/**
 * Resets a player's plus/minus stats by deleting all their plusMinus entries
 * and refreshing their aggregated stats
 * @param playerId The team_member.id of the player
 * @returns Promise<boolean> Success status
 */
export const resetPlayerPlusMinusStats = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Resetting plus/minus stats for player ${playerId}`);
    
    // Step 1: Delete all plusMinus entries for this player from game_stats
    const { error: deleteError } = await supabase
      .from('game_stats')
      .delete()
      .eq('player_id', playerId)
      .eq('stat_type', 'plusMinus');
      
    if (deleteError) {
      console.error('Error deleting plus/minus stats:', deleteError);
      return false;
    }
    
    console.log(`Successfully deleted plus/minus entries for player ${playerId}`);
    
    // Step 2: Process all events to recreate plus/minus stats
    const success = await processEventsToStats(playerId);
    if (!success) {
      console.error(`Failed to reprocess events for player ${playerId}`);
      return false;
    }
    
    // Step 3: Call refresh_player_stats to update the aggregated stats
    const { error: refreshError } = await supabase.rpc(
      'refresh_player_stats',
      { player_id: playerId }
    );
    
    if (refreshError) {
      console.error('Error refreshing player stats:', refreshError);
      return false;
    }
    
    console.log(`Successfully refreshed stats for player ${playerId}`);
    return true;
  } catch (error) {
    console.error('Error in resetPlayerPlusMinusStats:', error);
    return false;
  }
};

/**
 * Processes game events for a player and creates appropriate game stats
 * @param playerId The team_member.id of the player to process
 */
export const createGameStatsFromEvents = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Processing events for player ${playerId}`);
    
    // Get events where this player was involved
    const { data: eventsData, error: eventsError } = await supabase
      .from('event_players')
      .select(`
        event_id,
        game_events(id, game_id, event_type, period, team_type, details, timestamp, created_at)
      `)
      .eq('player_id', playerId);
    
    if (eventsError) {
      console.error('Error getting events:', eventsError);
      return false;
    }
    
    if (!eventsData || eventsData.length === 0) {
      console.log(`No events found for player ${playerId}`);
      return true; // No events to process is not an error
    }
    
    console.log(`Found ${eventsData.length} events for player ${playerId}`);
    
    // Process each event
    let processedEvents = 0;
    for (const eventPlayer of eventsData) {
      // Get the event data properly
      const eventData = eventPlayer.game_events as any;
      if (!eventData) continue;
      
      // Convert the data to a GameEvent type safely
      const event: GameEvent = {
        id: eventData.id,
        game_id: eventData.game_id,
        event_type: eventData.event_type,
        period: eventData.period,
        team_type: eventData.team_type,
        details: eventData.details,
        timestamp: eventData.timestamp || new Date().toISOString(),
        created_at: eventData.created_at || new Date().toISOString()
      };
      
      // Process event based on type
      let processed = false;
      switch (event.event_type) {
        case 'goal':
          processed = await processGoalEvent(event);
          break;
        
        // Add more event type processors as needed
        
        default:
          // No processor for this event type
          break;
      }
      
      if (processed) {
        processedEvents++;
      }
    }
    
    console.log(`Successfully processed ${processedEvents} events for player ${playerId}`);
    return true;
  } catch (error) {
    console.error('Error in createGameStatsFromEvents:', error);
    return false;
  }
};

/**
 * Process all events for a player and update their stats
 */
export const processEventsToStats = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Processing all events for player ${playerId}`);
    const success = await createGameStatsFromEvents(playerId);
    if (!success) {
      console.error('Failed to process events to stats');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in processEventsToStats:', error);
    return false;
  }
};
