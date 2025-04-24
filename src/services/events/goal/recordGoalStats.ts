
import { supabase } from '@/lib/supabase';
import { recordPlusMinusStats } from '@/services/stats/gameStatsService';
import { refreshPlayerStats } from '@/services/stats';

/**
 * Data structure for recording goal stats
 */
interface GoalStatsData {
  gameId: string;
  period: number;
  scorerId?: string;  // team_member.id
  primaryAssistId?: string;  // team_member.id
  secondaryAssistId?: string;  // team_member.id
  playersOnIce: string[];  // Array of team_member.id
  isHomeScoringTeam: boolean;
}

/**
 * Records all stats related to a goal event
 */
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
    console.log(`Recording goal for player (team_member.id): ${scorerId}`);
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
    console.log(`Recording primary assist for player (team_member.id): ${primaryAssistId}`);
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
    console.log(`Recording secondary assist for player (team_member.id): ${secondaryAssistId}`);
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
    console.log("Recording plus/minus for players (team_member.ids):", playersOnIce);
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

/**
 * Helper function to safely insert a game stat
 */
async function insertStatSafely(
  gameId: string,
  playerId: string,  // team_member.id
  statType: string,
  period: number,
  value: number,
  details: string = ''
) {
  try {
    console.log(`Recording ${statType} stat for player ${playerId}`);
    
    const { data, error } = await supabase
      .rpc('record_game_stat', {
        p_game_id: gameId,
        p_player_id: playerId,  // Using team_member.id consistently
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
