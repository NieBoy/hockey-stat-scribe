
import { supabase } from '@/lib/supabase';
import { GameStat, User } from '@/types';
import { calculatePlusMinus } from './plusMinus';

interface GameStatData {
  game_id: string;
  player_id: string;
  stat_type: string;
  period: number;
  value: number;
  details?: string;
}

/**
 * Inserts a game stat into the database
 */
export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.game_id,
      p_player_id: stat.player_id,
      p_stat_type: stat.stat_type,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });

    if (error) {
      console.error("Error inserting game stat:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception in insertGameStat:", error);
    return false;
  }
};

/**
 * Records plus/minus stats for players who were on ice during a goal
 */
export const recordPlusMinusStats = async (
  gameId: string,
  players: User[], 
  scoringTeamType: 'home' | 'away',
  period: number
): Promise<boolean> => {
  try {
    let allSuccess = true;
    
    // For each player on ice, record a plus/minus stat
    for (const player of players) {
      try {
        // Use the standardized function to calculate and record plus/minus
        const success = await calculatePlusMinus(gameId, player.id, scoringTeamType, period);
        if (!success) {
          console.error(`Failed to record plus/minus for player ${player.name} (${player.id})`);
          allSuccess = false;
        }
      } catch (playerError) {
        console.error(`Error recording plus/minus for player ${player.name}:`, playerError);
        allSuccess = false;
      }
    }
    
    return allSuccess;
  } catch (error) {
    console.error("Error in recordPlusMinusStats:", error);
    return false;
  }
};
