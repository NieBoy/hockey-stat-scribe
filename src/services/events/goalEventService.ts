
import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

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

    // Instead of direct insert, we'll call the database function to bypass RLS
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
    if (data.scorerId && data.teamType === 'home') {
      await insertStatSafely(data.gameId, data.scorerId, 'goals', data.period, 1);
    }
    
    // Record primary assist if provided
    if (data.primaryAssistId && data.teamType === 'home') {
      await insertStatSafely(data.gameId, data.primaryAssistId, 'assists', data.period, 1, 'primary');
    }
    
    // Record secondary assist if provided
    if (data.secondaryAssistId && data.teamType === 'home') {
      await insertStatSafely(data.gameId, data.secondaryAssistId, 'assists', data.period, 1, 'secondary');
    }
    
    // Record plus/minus for players on ice
    if (data.playersOnIce.length > 0) {
      await recordPlusMinusStats(
        data.gameId,
        data.playersOnIce,
        data.period,
        data.teamType === 'home'
      );
    }

    return { success: true, eventId: eventData?.id };
  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};

// Helper function to safely insert stats with better error handling
const insertStatSafely = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  value: number,
  details: string = ''
) => {
  try {
    const { error } = await supabase
      .from('game_stats')
      .insert({
        game_id: gameId,
        player_id: playerId,
        stat_type: statType,
        period: period,
        value: value,
        details: details,
        timestamp: new Date().toISOString()
      });
    
    if (error) console.error(`Error recording ${statType} stat:`, error);
  } catch (err) {
    console.error(`Failed to record ${statType} stat:`, err);
  }
};
