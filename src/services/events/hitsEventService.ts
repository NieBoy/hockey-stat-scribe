
import { supabase } from '@/lib/supabase';
import { User, Game } from '@/types';
import { toast } from 'sonner';

interface HitEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
}

export const recordHitEvent = async (data: HitEventData) => {
  try {
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'hits',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: JSON.stringify({
          playerId: data.playerId
        })
      });

    if (eventError) throw eventError;

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

    return eventData;
  } catch (error) {
    console.error("Error recording hit:", error);
    throw error;
  }
};
