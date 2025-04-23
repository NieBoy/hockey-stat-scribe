
import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';
import { refreshPlayerStats } from '@/services/stats';

interface GoalStatsData {
  gameId: string;
  period: number;
  scorerId?: string;
  primaryAssistId?: string;
  secondaryAssistId?: string;
  playersOnIce: string[];
  isHomeScoringTeam: boolean;
}

export async function recordGoalStats({
  gameId,
  period,
  scorerId,
  primaryAssistId,
  secondaryAssistId,
  playersOnIce,
  isHomeScoringTeam
}: GoalStatsData) {
  // Record goal stat if scorer provided
  if (scorerId) {
    console.log(`Recording goal for player: ${scorerId}`);
    await insertStatSafely(gameId, scorerId, 'goals', period, 1);
    
    try {
      await refreshPlayerStats(scorerId);
      console.log("Scorer stats refreshed");
    } catch (refreshError) {
      console.error("Error refreshing scorer stats:", refreshError);
    }
  }
  
  // Record primary assist if provided
  if (primaryAssistId) {
    console.log(`Recording primary assist for player: ${primaryAssistId}`);
    await insertStatSafely(gameId, primaryAssistId, 'assists', period, 1, 'primary');
    
    try {
      await refreshPlayerStats(primaryAssistId);
      console.log("Primary assist player stats refreshed");
    } catch (refreshError) {
      console.error("Error refreshing primary assist player stats:", refreshError);
    }
  }
  
  // Record secondary assist if provided
  if (secondaryAssistId) {
    console.log(`Recording secondary assist for player: ${secondaryAssistId}`);
    await insertStatSafely(gameId, secondaryAssistId, 'assists', period, 1, 'secondary');
    
    try {
      await refreshPlayerStats(secondaryAssistId);
      console.log("Secondary assist player stats refreshed");
    } catch (refreshError) {
      console.error("Error refreshing secondary assist player stats:", refreshError);
    }
  }
  
  // Record plus/minus for players on ice
  if (playersOnIce.length > 0) {
    console.log("Recording plus/minus for players:", playersOnIce);
    try {
      await recordPlusMinusStats(
        gameId,
        playersOnIce,
        period,
        isHomeScoringTeam,
        isHomeScoringTeam ? 1 : -1
      );
    } catch (plusMinusError) {
      console.error("Error recording plus/minus stats:", plusMinusError);
    }
  }
}

async function insertStatSafely(
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  value: number,
  details: string = ''
) {
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
}
