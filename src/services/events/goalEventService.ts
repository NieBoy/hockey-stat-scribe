
import { supabase } from '@/lib/supabase';
import { Game, User } from '@/types';

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
    // First, record the main goal event
    const { error: eventError } = await supabase
      .from('game_events')
      .insert({
        game_id: data.gameId,
        event_type: 'goal',
        team_type: data.teamType,
        period: data.period
      });

    if (eventError) throw eventError;

    // Record individual stats for the goal scorer
    if (data.scorerId) {
      await supabase.from('game_stats').insert({
        game_id: data.gameId,
        player_id: data.scorerId,
        stat_type: 'goals',
        period: data.period,
        value: 1,
        timestamp: new Date().toISOString()
      });
    }

    // Record primary assist
    if (data.primaryAssistId) {
      await supabase.from('game_stats').insert({
        game_id: data.gameId,
        player_id: data.primaryAssistId,
        stat_type: 'assists',
        period: data.period,
        value: 1,
        details: 'primary',
        timestamp: new Date().toISOString()
      });
    }

    // Record secondary assist
    if (data.secondaryAssistId) {
      await supabase.from('game_stats').insert({
        game_id: data.gameId,
        player_id: data.secondaryAssistId,
        stat_type: 'assists',
        period: data.period,
        value: 1,
        details: 'secondary',
        timestamp: new Date().toISOString()
      });
    }

    // Record plus/minus for all players on ice
    for (const playerId of data.playersOnIce) {
      await supabase.from('game_stats').insert({
        game_id: data.gameId,
        player_id: playerId,
        stat_type: data.teamType === 'home' ? 'plus' : 'minus',
        period: data.period,
        value: 1,
        timestamp: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error recording goal event:', error);
    throw error;
  }
};
