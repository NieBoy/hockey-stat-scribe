
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { validatePlayerId, validateMultiplePlayers } from "./shared/validatePlayer";

interface GoalEventData {
  gameId: string;
  period: number;
  teamType: 'home' | 'away';
  playersOnIce: string[];
  scorerId?: string;
  primaryAssistId?: string;
  secondaryAssistId?: string;
  opponentData?: {
    scorerJersey?: string;
    primaryAssistJersey?: string;
    secondaryAssistJersey?: string;
  };
}

export const recordGoalEvent = async (goalData: GoalEventData): Promise<boolean> => {
  try {
    console.log("Recording goal event with data:", goalData);
    
    // Validate player IDs for our team players
    const playerIds = [
      ...goalData.playersOnIce,
      goalData.scorerId,
      goalData.primaryAssistId,
      goalData.secondaryAssistId
    ].filter(Boolean) as string[];
    
    const arePlayersValid = playerIds.length > 0 ? await validateMultiplePlayers(playerIds) : true;
    if (!arePlayersValid) {
      toast.error("Invalid Player Data", {
        description: "One or more players could not be validated"
      });
      return false;
    }
    
    // Create the details object for the event
    const details = {
      playersOnIce: goalData.playersOnIce || [],
      playerId: goalData.scorerId,
      primaryAssistId: goalData.primaryAssistId,
      secondaryAssistId: goalData.secondaryAssistId,
      opponentData: goalData.opponentData
    };

    // Create the goal event
    const { data: eventData, error: eventError } = await supabase.rpc(
      'create_game_event',
      {
        p_game_id: goalData.gameId,
        p_event_type: 'goal',
        p_period: goalData.period,
        p_team_type: goalData.teamType,
        p_details: details
      }
    );

    if (eventError) {
      console.error("Error creating goal event:", eventError);
      return false;
    }

    // Record individual game stats, only for home team players
    const statPromises = [];
    
    // Record goal for scorer if it's our team's player
    if (goalData.scorerId) {
      statPromises.push(
        supabase.rpc('record_game_stat', {
          p_game_id: goalData.gameId,
          p_player_id: goalData.scorerId,
          p_stat_type: 'goals',
          p_period: goalData.period,
          p_value: 1,
          p_details: ''
        })
      );
    }

    // Record primary assist
    if (goalData.primaryAssistId) {
      statPromises.push(
        supabase.rpc('record_game_stat', {
          p_game_id: goalData.gameId,
          p_player_id: goalData.primaryAssistId,
          p_stat_type: 'assists',
          p_period: goalData.period,
          p_value: 1,
          p_details: 'primary'
        })
      );
    }

    // Record secondary assist
    if (goalData.secondaryAssistId) {
      statPromises.push(
        supabase.rpc('record_game_stat', {
          p_game_id: goalData.gameId,
          p_player_id: goalData.secondaryAssistId,
          p_stat_type: 'assists',
          p_period: goalData.period,
          p_value: 1,
          p_details: 'secondary'
        })
      );
    }

    // Record plus for our team players on ice or minus for home team when opponent scored
    const isOpponentGoal = goalData.teamType === 'away' && goalData.opponentData;
    
    // For opponent goals, record minus for home team players on ice
    if (isOpponentGoal) {
      for (const playerId of goalData.playersOnIce) {
        statPromises.push(
          supabase.rpc('record_game_stat', {
            p_game_id: goalData.gameId,
            p_player_id: playerId,
            p_stat_type: 'plusMinus',
            p_period: goalData.period,
            p_value: -1,
            p_details: 'minus'
          })
        );
      }
    } else {
      // For home team goals, record plus for all players on ice
      for (const playerId of goalData.playersOnIce) {
        statPromises.push(
          supabase.rpc('record_game_stat', {
            p_game_id: goalData.gameId,
            p_player_id: playerId,
            p_stat_type: 'plusMinus',
            p_period: goalData.period,
            p_value: 1,
            p_details: 'plus'
          })
        );
      }
    }

    // Execute all stat recording operations
    const results = await Promise.allSettled(statPromises);
    
    // Check for errors in the stat recordings
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      console.error(`${errors.length} errors occurred while recording goal stats:`, errors);
      // We don't return false here because the event was created successfully
      // The stats that failed can be regenerated later with the refresh function
    }

    return true;
  } catch (error) {
    console.error("Error in recordGoalEvent:", error);
    return false;
  }
};

export const deleteGoalEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'delete_game_event',
      { p_event_id: eventId }
    );

    if (error) {
      console.error("Error deleting goal event:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteGoalEvent:", error);
    return false;
  }
};
