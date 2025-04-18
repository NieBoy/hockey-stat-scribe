
import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';

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
    // 1. Record the event
    const { error: eventError } = await supabase
      .from('game_events')
      .insert({
        game_id: data.gameId,
        event_type: 'goal',
        period: data.period,
        team_type: data.teamType,
      });

    if (eventError) throw new Error(`Event error: ${eventError.message}`);

    // 2. Record stats for the goal and assists
    if (data.teamType === 'home') {
      // Goal for the scorer
      if (data.scorerId) {
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
        
        if (goalError) throw new Error(`Goal stat error: ${goalError.message}`);
      }
      
      // Primary assist
      if (data.primaryAssistId) {
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
          
        if (assistError) throw new Error(`Primary assist error: ${assistError.message}`);
      }
      
      // Secondary assist
      if (data.secondaryAssistId) {
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
          
        if (assistError) throw new Error(`Secondary assist error: ${assistError.message}`);
      }
      
      // 3. Record plus/minus for players on ice
      // Plus for home team players on ice
      if (data.playersOnIce.length > 0) {
        await recordPlusMinusStats(
          data.gameId,
          data.playersOnIce,
          data.period,
          true // isPlus = true for home team goal
        );
      }
      
    } else if (data.teamType === 'away') {
      // For away team goals, record minus for home players on ice
      if (data.playersOnIce.length > 0) {
        await recordPlusMinusStats(
          data.gameId,
          data.playersOnIce,
          data.period,
          false // isPlus = false for away team goal
        );
      }
    }

    return { success: true };

  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};
