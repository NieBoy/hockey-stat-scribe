
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FaceoffEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  isWon: boolean;
}

export const recordFaceoffEvent = async (data: FaceoffEventData) => {
  try {
    console.log("Recording faceoff event with data:", data);
    
    if (!data.gameId || !data.period || !data.teamType) {
      throw new Error("Missing required faceoff event data");
    }

    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'faceoff',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: JSON.stringify({
          playerId: data.playerId,
          isWon: data.isWon
        })
      });

    if (eventError) {
      console.error("Error recording faceoff event:", eventError);
      throw new Error(eventError.message);
    }

    // Record the faceoff stat for the player
    const { error: statError } = await supabase
      .rpc('record_game_stat', {
        p_game_id: data.gameId,
        p_player_id: data.playerId,
        p_stat_type: data.isWon ? 'faceoff_wins' : 'faceoff_losses',
        p_period: data.period,
        p_value: 1
      });

    if (statError) {
      console.error("Error recording faceoff stat:", statError);
      throw new Error(statError.message);
    }

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordFaceoffEvent:", error);
    throw error;
  }
};
