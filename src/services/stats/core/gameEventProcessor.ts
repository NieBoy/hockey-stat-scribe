import { GameEvent } from '@/types';
import { createGameStat } from './utils/statsDbUtils';
import { supabase } from '@/lib/supabase';

// Process game events to generate stats
export const processEventsToStats = async (events: GameEvent[]): Promise<boolean> => {
  try {
    for (const event of events) {
      // Process based on event type
      switch (event.event_type) {
        case 'goal':
          // Goal processing logic
          break;
        case 'shot':
          // Shot processing logic
          break;
        // ... other event types
      }
    }
    return true;
  } catch (error) {
    console.error('Error processing events:', error);
    return false;
  }
};

// Function to reset plus/minus stats for a specific player
export const resetPlayerPlusMinusStats = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Resetting plus/minus stats for player ${playerId}`);
    
    // Step 1: Delete all plusMinus entries from game_stats for this player
    const { error: deleteError, count } = await supabase
      .from('game_stats')
      .delete()
      .eq('player_id', playerId)
      .eq('stat_type', 'plusMinus')
      .select('count');
      
    if (deleteError) {
      console.error('Error deleting plusMinus stats:', deleteError);
      return false;
    }
    
    console.log(`Deleted ${count} plusMinus stats entries`);
    
    // Step 2: Reset the plusMinus value in player_stats to 0
    const { error: updateError } = await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,
        stat_type: 'plusMinus',
        value: 0,
        games_played: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'player_id,stat_type'
      });
      
    if (updateError) {
      console.error('Error resetting player plusMinus stat:', updateError);
      return false;
    }
    
    console.log('Successfully reset plusMinus stat for player');
    return true;
  } catch (error) {
    console.error('Error in resetPlayerPlusMinusStats:', error);
    return false;
  }
};

// Export the original function
export const createGameStatsFromEvents = processEventsToStats;
