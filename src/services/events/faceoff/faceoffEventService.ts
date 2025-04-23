
import { supabase } from '@/lib/supabase';
import { FaceoffEventData } from '../types';
import { validatePlayer } from '../shared/validatePlayer';
import { refreshPlayerStats } from '@/services/stats';

export const recordFaceoffEvent = async (data: FaceoffEventData) => {
  try {
    console.log("Recording faceoff event with data:", data);
    
    // Validate the player
    await validatePlayer(data.playerId);
    
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'faceoff',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: {
          playerId: data.playerId,
          isWon: data.isWon
        }
      });

    if (eventError) throw eventError;

    // Record the faceoff stat
    const { error: statError } = await supabase
      .rpc('record_game_stat', {
        p_game_id: data.gameId,
        p_player_id: data.playerId,
        p_stat_type: data.isWon ? 'faceoff_wins' : 'faceoff_losses',
        p_period: data.period,
        p_value: 1
      });

    if (statError) throw statError;

    // Refresh player stats
    await refreshPlayerStats(data.playerId);

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordFaceoffEvent:", error);
    throw error;
  }
};
