
import { supabase } from '@/lib/supabase';
import { HitEventData } from '../types';
import { validatePlayer } from '../shared/validatePlayer';
import { refreshPlayerStats } from '@/services/stats';

export const recordHitEvent = async (data: HitEventData) => {
  try {
    console.log("Recording hit event with data:", data);
    
    // Validate the player
    const isValid = await validatePlayer(data.playerId);
    if (!isValid) {
      throw new Error(`Invalid player ID: ${data.playerId}`);
    }
    
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'hits',
        p_period: data.period,
        p_team_type: data.teamType
      });

    if (eventError) {
      console.error("Error recording hit event:", eventError);
      throw eventError;
    }

    // Record the hit stat
    const { error: statError } = await supabase
      .rpc('record_game_stat', {
        p_game_id: data.gameId,
        p_player_id: data.playerId,
        p_stat_type: 'hits',
        p_period: data.period,
        p_value: 1
      });

    if (statError) throw statError;

    // Refresh player stats
    await refreshPlayerStats(data.playerId);

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordHitEvent:", error);
    throw error;
  }
};
