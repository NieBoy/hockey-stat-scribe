
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
  isHomeTeamScoring: boolean;
  opponentData?: {
    scorerJersey?: string;
    primaryAssistJersey?: string;
    secondaryAssistJersey?: string;
  };
}

export const recordGoalEvent = async (goalData: GoalEventData): Promise<boolean> => {
  try {
    console.log("Recording goal event with data:", goalData);
    console.log("Is home team scoring:", goalData.isHomeTeamScoring);
    
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
      opponentData: goalData.opponentData,
      isHomeTeamScoring: goalData.isHomeTeamScoring
    };

    // Ensure opponentData is properly formatted
    if (goalData.teamType === 'away' && goalData.opponentData) {
      if (!goalData.opponentData.scorerJersey || goalData.opponentData.scorerJersey === 'Unknown') {
        console.log("Setting opponent goal with unknown player");
        if (!details.opponentData) {
          details.opponentData = {};
        }
        details.opponentData.scorerJersey = 'Unknown';
      }
      
      // Fix the format of primaryAssistJersey and secondaryAssistJersey
      if (details.opponentData) {
        // Convert any undefined or object values to strings or undefined
        if (details.opponentData.primaryAssistJersey && 
            typeof details.opponentData.primaryAssistJersey === 'object') {
          details.opponentData.primaryAssistJersey = undefined;
        }
        
        if (details.opponentData.secondaryAssistJersey && 
            typeof details.opponentData.secondaryAssistJersey === 'object') {
          details.opponentData.secondaryAssistJersey = undefined;
        }
      }
    }

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

    // Handle plus/minus for players on ice
    // This is the key change for tracking plus/minus correctly
    const isHomeTeamScoring = goalData.isHomeTeamScoring || goalData.teamType === 'home';
    
    for (const playerId of goalData.playersOnIce) {
      // For home team goals, record +1 for all players on ice
      // For opponent goals, record -1 for all players on ice
      const plusMinusValue = isHomeTeamScoring ? 1 : -1;
      const plusMinusDetail = isHomeTeamScoring ? 'plus' : 'minus';
      
      console.log(`Recording ${plusMinusDetail} (${plusMinusValue}) for player ${playerId}`);
      
      statPromises.push(
        supabase.rpc('record_game_stat', {
          p_game_id: goalData.gameId,
          p_player_id: playerId,
          p_stat_type: 'plusMinus',
          p_period: goalData.period,
          p_value: Math.abs(plusMinusValue), // Always store positive value with details
          p_details: plusMinusDetail
        })
      );
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
