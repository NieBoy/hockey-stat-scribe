import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import { refreshPlayerStats } from '@/services/stats/playerStatsService';

export interface GoalEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  scorerId?: string;
  primaryAssistId?: string;
  secondaryAssistId?: string;
  playersOnIce: string[];
}

export const recordGoalEvent = async (data: GoalEventData) => {
  try {
    console.log("Recording goal event with data:", data);
    
    // Make sure we have the minimum required data
    if (!data.gameId || !data.period || !data.teamType) {
      throw new Error("Missing required goal event data");
    }

    // Record the game event
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'goal',
        p_period: data.period,
        p_team_type: data.teamType
      });
      
    if (eventError) {
      console.error("Error calling create_game_event function:", eventError);
      throw new Error(`Failed to record goal event: ${eventError.message}`);
    }
    
    // Record goal stat if scorer provided
    if (data.scorerId) {
      console.log(`Recording goal for player: ${data.scorerId}`);
      const goalResult = await insertStatSafely(data.gameId, data.scorerId, 'goals', data.period, 1);
      if (goalResult) {
        console.log("Successfully recorded goal stat:", goalResult);
      }
      
      // Refresh scorer's stats
      try {
        await refreshPlayerStats(data.scorerId);
        console.log("Scorer stats refreshed");
      } catch (refreshError) {
        console.error("Error refreshing scorer stats:", refreshError);
      }
    }
    
    // Record primary assist if provided
    if (data.primaryAssistId) {
      console.log(`Recording primary assist for player: ${data.primaryAssistId}`);
      const primaryAssistResult = await insertStatSafely(data.gameId, data.primaryAssistId, 'assists', data.period, 1, 'primary');
      if (primaryAssistResult) {
        console.log("Successfully recorded primary assist stat:", primaryAssistResult);
      }
      
      // Refresh primary assist player's stats
      try {
        await refreshPlayerStats(data.primaryAssistId);
        console.log("Primary assist player stats refreshed");
      } catch (refreshError) {
        console.error("Error refreshing primary assist player stats:", refreshError);
      }
    }
    
    // Record secondary assist if provided
    if (data.secondaryAssistId) {
      console.log(`Recording secondary assist for player: ${data.secondaryAssistId}`);
      const secondaryAssistResult = await insertStatSafely(data.gameId, data.secondaryAssistId, 'assists', data.period, 1, 'secondary');
      if (secondaryAssistResult) {
        console.log("Successfully recorded secondary assist stat:", secondaryAssistResult);
      }
      
      // Refresh secondary assist player's stats
      try {
        await refreshPlayerStats(data.secondaryAssistId);
        console.log("Secondary assist player stats refreshed");
      } catch (refreshError) {
        console.error("Error refreshing secondary assist player stats:", refreshError);
      }
    }
    
    // Record plus/minus for players on ice
    if (data.playersOnIce.length > 0) {
      console.log("Recording plus/minus for players:", data.playersOnIce);
      await recordPlusMinusStats(
        data.gameId,
        data.playersOnIce,
        data.period,
        data.teamType === 'home'
      );
      
      // Refresh stats for all players on ice
      for (const playerId of data.playersOnIce) {
        try {
          await refreshPlayerStats(playerId);
          console.log(`Stats refreshed for player on ice: ${playerId}`);
        } catch (refreshError) {
          console.error(`Error refreshing stats for player ${playerId}:`, refreshError);
        }
      }
    }

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};

const insertStatSafely = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  value: number,
  details: string = ''
) => {
  try {
    const { data, error } = await supabase
      .rpc('record_game_stat', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_stat_type: statType,
        p_period: period,
        p_value: value,
        p_details: details
      });
    
    if (error) {
      console.error(`Error recording ${statType} stat:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Failed to record ${statType} stat:`, err);
    return null;
  }
};
