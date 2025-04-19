
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

    // Validate player IDs before proceeding
    if (data.scorerId) {
      const { count: scorerExists } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('id', data.scorerId);
        
      if (!scorerExists) {
        console.error(`Invalid scorer ID: ${data.scorerId}`);
        throw new Error(`Player with ID ${data.scorerId} does not exist`);
      }
    }
    
    if (data.primaryAssistId) {
      const { count: primaryAssistExists } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('id', data.primaryAssistId);
        
      if (!primaryAssistExists) {
        console.error(`Invalid primary assist ID: ${data.primaryAssistId}`);
        throw new Error(`Player with ID ${data.primaryAssistId} does not exist`);
      }
    }
    
    if (data.secondaryAssistId) {
      const { count: secondaryAssistExists } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('id', data.secondaryAssistId);
        
      if (!secondaryAssistExists) {
        console.error(`Invalid secondary assist ID: ${data.secondaryAssistId}`);
        throw new Error(`Player with ID ${data.secondaryAssistId} does not exist`);
      }
    }

    // Validate players on ice
    if (data.playersOnIce.length > 0) {
      const { data: validPlayers, error: validationError } = await supabase
        .from('team_members')
        .select('id')
        .in('id', data.playersOnIce);
        
      if (validationError) {
        console.error("Error validating players on ice:", validationError);
        throw new Error("Failed to validate players on ice");
      }
      
      const validPlayerIds = validPlayers.map(p => p.id);
      const invalidPlayers = data.playersOnIce.filter(id => !validPlayerIds.includes(id));
      
      if (invalidPlayers.length > 0) {
        console.error("Invalid player IDs:", invalidPlayers);
        throw new Error(`Some players on ice do not exist: ${invalidPlayers.join(', ')}`);
      }
    }

    // Create the details object with player information
    const details = {
      playerId: data.scorerId,
      primaryAssistId: data.primaryAssistId,
      secondaryAssistId: data.secondaryAssistId,
      playersOnIce: data.playersOnIce
    };

    // Record the game event with details explicitly passed as a parameter
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'goal',
        p_period: data.period,
        p_team_type: data.teamType,
        p_details: details
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
    
    // Ensure the players on ice exist before recording plus/minus
    if (data.playersOnIce.length > 0) {
      console.log("Recording plus/minus for players:", data.playersOnIce);
      try {
        await recordPlusMinusStats(
          data.gameId,
          data.playersOnIce,
          data.period,
          data.teamType === 'home'
        );
      } catch (plusMinusError) {
        console.error("Error recording plus/minus stats:", plusMinusError);
        // Continue execution even if plus/minus stats fail
      }
      
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
    // First verify that the player exists
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('id', playerId);
      
    if (!count) {
      console.error(`Player ID ${playerId} does not exist`);
      return null;
    }
    
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
