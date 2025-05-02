
import { supabase } from '@/lib/supabase';
import { ShotEventData } from '../types';
import { validatePlayer } from '../shared/validatePlayer';
import { refreshPlayerStats } from '@/services/stats';

export const recordShotEvent = async (data: ShotEventData) => {
  try {
    console.log("Recording shot event with data:", data);
    
    // Validate the player
    const isValid = await validatePlayer(data.playerId);
    if (!isValid) {
      throw new Error(`Invalid player ID: ${data.playerId}`);
    }
    
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'shot',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: {
          playerId: data.playerId,
          isForUs: data.isForUs
        }
      });

    if (eventError) throw eventError;

    // Record the shot stat
    const { error: statError } = await supabase
      .rpc('record_game_stat', {
        p_game_id: data.gameId,
        p_player_id: data.playerId,
        p_stat_type: data.isForUs ? 'shots' : 'shots_against',
        p_period: data.period,
        p_value: 1
      });

    if (statError) throw statError;

    // Refresh player stats
    await refreshPlayerStats(data.playerId);

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordShotEvent:", error);
    throw error;
  }
};
