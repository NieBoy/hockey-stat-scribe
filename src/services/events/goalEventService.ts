
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

interface GameEventResponse {
  id: string;
  game_id: string;
  event_type: string;
  period: number;
  team_type: string;
}

export const recordGoalEvent = async (data: GoalEventData) => {
  try {
    console.log("Recording goal event with data:", data);
    
    // Make sure we have the minimum required data
    if (!data.gameId || !data.period || !data.teamType) {
      throw new Error("Missing required goal event data");
    }
    
    // First, create the goal event with RPC to bypass RLS issues
    const { data: eventData, error: eventError } = await supabase
      .rpc('create_game_event', {
        p_game_id: data.gameId,
        p_event_type: 'goal',
        p_period: data.period,
        p_team_type: data.teamType
      });
      
    if (eventError) {
      console.error("Error recording game event:", eventError);
      throw new Error(`Failed to record goal event: ${eventError.message}`);
    }
    
    // If we don't have an event ID back, we can't continue
    if (!eventData) {
      throw new Error("Failed to get event data after creation");
    }
    
    // Parse the response data to get the event ID
    let eventId: string;
    if (typeof eventData === 'object' && eventData !== null && 'id' in eventData) {
      eventId = eventData.id as string;
    } else {
      console.error("Unexpected event data format:", eventData);
      throw new Error("Could not get event ID from response");
    }
    
    console.log("Created game event with ID:", eventId);
    
    // Record goal stat if scorer provided
    if (data.scorerId && data.teamType === 'home') {
      try {
        const { error: goalError } = await supabase
          .from('game_stats')
          .insert({
            game_id: data.gameId,
            player_id: data.scorerId,
            stat_type: 'goals',
            period: data.period,
            value: 1,
            timestamp: new Date().toISOString()
          });
        
        if (goalError) console.error("Error recording goal stat:", goalError);
      } catch (err) {
        console.error("Failed to record goal stat:", err);
      }
    }
    
    // Record primary assist if provided
    if (data.primaryAssistId && data.teamType === 'home') {
      try {
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
          
        if (assistError) console.error("Error recording primary assist:", assistError);
      } catch (err) {
        console.error("Failed to record primary assist stat:", err);
      }
    }
    
    // Record secondary assist if provided
    if (data.secondaryAssistId && data.teamType === 'home') {
      try {
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
          
        if (assistError) console.error("Error recording secondary assist:", assistError);
      } catch (err) {
        console.error("Failed to record secondary assist stat:", err);
      }
    }
    
    // Record plus/minus for players on ice
    if (data.playersOnIce.length > 0 && data.teamType) {
      try {
        console.log(`Recording ${data.teamType === 'home' ? 'plus' : 'minus'} for players:`, data.playersOnIce);
        await recordPlusMinusStats(
          data.gameId,
          data.playersOnIce,
          data.period,
          data.teamType === 'home' // isPlus = true for home team goal
        );
      } catch (err) {
        console.error("Failed to record plus/minus for players:", err);
      }
    }

    return { success: true, eventId };

  } catch (error) {
    console.error("Error recording goal event:", error);
    throw error;
  }
};
