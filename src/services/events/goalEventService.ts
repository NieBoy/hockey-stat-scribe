
import { supabase } from '@/lib/supabase';
import { validatePlayers } from './goal/validatePlayers';
import { recordGoalStats } from './goal/recordGoalStats';
import { GoalEventData } from './goal/types';

export const recordGoalEvent = async (data: GoalEventData) => {
  try {
    console.log("Recording goal event with data:", data);
    
    // Make sure we have the minimum required data
    if (!data.gameId || !data.period || !data.teamType) {
      throw new Error("Missing required goal event data");
    }

    // Validate all players before proceeding
    await validatePlayers(data.scorerId, data.primaryAssistId, data.secondaryAssistId);

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

    console.log("Creating game event with details:", details);
    
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
    
    console.log("Successfully created game event:", eventData);
    
    // Record all related stats
    await recordGoalStats({
      gameId: data.gameId,
      period: data.period,
      scorerId: data.scorerId,
      primaryAssistId: data.primaryAssistId,
      secondaryAssistId: data.secondaryAssistId,
      playersOnIce: data.playersOnIce,
      isHomeScoringTeam: data.teamType === 'home'
    });

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};
