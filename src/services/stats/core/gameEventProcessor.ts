import { supabase } from '@/lib/supabase';
import { createGameStat } from './utils/statsDbUtils';

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
    
    // Step 2: Call refresh_player_stats to update the aggregated stats
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
        game_events(id, game_id, event_type, period, team_type, details)
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
    for (const eventPlayer of eventsData) {
      const event = eventPlayer.game_events;
      if (!event) continue;
      
      // Determine what type of event it is and create appropriate game stats
      switch (event.event_type) {
        case 'goal':
          // Goal events handled elsewhere
          break;
        
        default:
          // Other event types handled elsewhere
          break;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in createGameStatsFromEvents:', error);
    return false;
  }
};
