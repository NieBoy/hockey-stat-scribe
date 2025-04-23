
import { supabase } from '@/lib/supabase';
import { PenaltyEventData } from '../types';
import { validatePlayer } from '../shared/validatePlayer';
import { refreshPlayerStats } from '@/services/stats';

export const recordPenaltyEvent = async (data: PenaltyEventData) => {
  try {
    console.log("Recording penalty event with data:", data);
    
    // Validate the player
    await validatePlayer(data.playerId);
    
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'penalty',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: {
          playerId: data.playerId,
          penaltyType: data.penaltyType,
          duration: data.duration,
          additionalPenalty: data.additionalPenalty
        }
      });

    if (eventError) throw eventError;

    // Record the penalty stat
    const penaltyMinutes = data.duration === 'minor' ? 2 : 5;
    const { error: statError } = await supabase
      .rpc('record_game_stat', {
        p_game_id: data.gameId,
        p_player_id: data.playerId,
        p_stat_type: 'penalties',
        p_period: data.period,
        p_value: penaltyMinutes,
        p_details: data.penaltyType
      });

    if (statError) throw statError;

    // Refresh player stats
    await refreshPlayerStats(data.playerId);

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordPenaltyEvent:", error);
    throw error;
  }
};
