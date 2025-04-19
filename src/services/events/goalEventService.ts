
import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';
import { toast } from 'sonner';

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
  // Start a transaction by wrapping everything in a try-catch
  try {
    console.log("Recording goal event with data:", data);
    
    // First, record the goal event in the game_events table
    const { error: eventError } = await supabase
      .from('game_events')
      .insert({
        game_id: data.gameId,
        event_type: 'goal',
        period: data.period,
        team_type: data.teamType
      });
      
    if (eventError) {
      console.error("Error recording game event:", eventError);
      // Continue anyway - we'll still record the stats
    }
    
    // Record stats for the goal and assists if it's a home team goal
    if (data.teamType === 'home') {
      // Handle recording goal stats differently based on if player is in users table or not
      if (data.scorerId) {
        try {
          console.log("Recording goal stat for player:", data.scorerId);
          const { error: goalError } = await supabase
            .from('game_stats')
            .insert({
              game_id: data.gameId,
              player_id: data.scorerId,
              stat_type: 'goals',
              period: data.period,
              value: 1,
              details: '',
              timestamp: new Date().toISOString()
            });
          
          if (goalError) {
            console.error("Error recording goal stat:", goalError);
          }
        } catch (err) {
          console.error("Failed to record goal for player:", data.scorerId, err);
        }
      }
      
      // Primary assist
      if (data.primaryAssistId) {
        try {
          console.log("Recording primary assist for player:", data.primaryAssistId);
          const { error: assistError } = await supabase
            .from('game_stats')
            .insert({
              game_id: data.gameId,
              player_id: data.primaryAssistId,
              stat_type: 'assists',
              period: data.period,
              value: 1,
              details: 'primary',
              timestamp: new Date().toISOString()
            });
            
          if (assistError) {
            console.error("Error recording primary assist:", assistError);
          }
        } catch (err) {
          console.error("Failed to record primary assist for player:", data.primaryAssistId, err);
        }
      }
      
      // Secondary assist
      if (data.secondaryAssistId) {
        try {
          console.log("Recording secondary assist for player:", data.secondaryAssistId);
          const { error: assistError } = await supabase
            .from('game_stats')
            .insert({
              game_id: data.gameId,
              player_id: data.secondaryAssistId,
              stat_type: 'assists',
              period: data.period,
              value: 1,
              details: 'secondary',
              timestamp: new Date().toISOString()
            });
            
          if (assistError) {
            console.error("Error recording secondary assist:", assistError);
          }
        } catch (err) {
          console.error("Failed to record secondary assist for player:", data.secondaryAssistId, err);
        }
      }
      
      // Record plus/minus for players on ice
      if (data.playersOnIce.length > 0) {
        try {
          console.log("Recording plus for players on ice:", data.playersOnIce);
          await recordPlusMinusStats(
            data.gameId,
            data.playersOnIce,
            data.period,
            true // isPlus = true for home team goal
          );
        } catch (err) {
          console.error("Failed to record plus/minus for players:", data.playersOnIce, err);
        }
      }
      
    } else if (data.teamType === 'away') {
      // For away team goals, record minus for home players on ice
      if (data.playersOnIce.length > 0) {
        try {
          console.log("Recording minus for players on ice:", data.playersOnIce);
          await recordPlusMinusStats(
            data.gameId,
            data.playersOnIce,
            data.period,
            false // isPlus = false for away team goal
          );
        } catch (err) {
          console.error("Failed to record plus/minus for players:", data.playersOnIce, err);
        }
      }
    }

    return { success: true };

  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};
