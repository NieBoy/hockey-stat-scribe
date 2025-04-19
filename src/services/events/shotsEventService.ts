
import { supabase } from '@/lib/supabase';
import { User, Game } from '@/types';
import { toast } from 'sonner';

interface ShotEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  isForUs: boolean;
}

export const recordShotEvent = async (data: ShotEventData) => {
  try {
    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'shot',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: JSON.stringify({
          playerId: data.playerId,
          isForUs: data.isForUs
        })
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

    return eventData;
  } catch (error) {
    console.error("Error recording shot:", error);
    throw error;
  }
};
