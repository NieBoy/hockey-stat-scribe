import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PenaltyType } from '@/hooks/usePenaltyFlow';
import { refreshPlayerStats } from '@/services/stats/playerStatsService';

interface PenaltyEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playerId: string;
  penaltyType: PenaltyType;
  duration: 'minor' | 'major';
  additionalPenalty: 'none' | 'match' | 'game-misconduct';
}

export const recordPenaltyEvent = async (data: PenaltyEventData) => {
  try {
    console.log("Recording penalty event with data:", data);
    
    if (!data.gameId || !data.period || !data.teamType) {
      throw new Error("Missing required penalty event data");
    }

    // Record the game event using the database function
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'penalty',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: JSON.stringify({
          playerId: data.playerId,
          penaltyType: data.penaltyType,
          duration: data.duration,
          additionalPenalty: data.additionalPenalty
        })
      });

    if (eventError) {
      console.error("Error recording penalty event:", eventError);
      throw new Error(eventError.message);
    }

    // Record the penalty stat for the player
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

    if (statError) {
      console.error("Error recording penalty stat:", statError);
      throw new Error(statError.message);
    }

    // Automatically refresh player stats to update aggregates
    try {
      await refreshPlayerStats(data.playerId);
      console.log("Player stats refreshed after recording penalty");
    } catch (refreshError) {
      console.error("Error refreshing player stats:", refreshError);
      // Don't throw here to avoid affecting the main flow
    }

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error in recordPenaltyEvent:", error);
    throw error;
  }
};
