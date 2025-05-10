
import { supabase } from "@/lib/supabase";

interface GameStatParams {
  game_id: string;
  player_id: string;
  stat_type: string;
  period: number;
  value: number | string;
  details?: string | any;
}

/**
 * Creates a game stat with consistent parameter handling
 * Supports both object parameter style and individual parameters
 */
export const createGameStat = async (
  gameIdOrParams: string | GameStatParams,
  playerId?: string,
  statType?: string, 
  period?: number,
  value?: number | string,
  details?: string | any
): Promise<boolean> => {
  try {
    let params: GameStatParams;
    
    // Check if first parameter is an object (object style) or a string (individual params style)
    if (typeof gameIdOrParams === 'object') {
      params = gameIdOrParams;
    } else {
      // Using individual parameters
      params = {
        game_id: gameIdOrParams,
        player_id: playerId,
        stat_type: statType,
        period: period,
        value: value,
        details: details
      };
    }
    
    // Ensure value is always a number for consistency
    // This is especially important for plus/minus calculations
    const numericValue = typeof params.value === 'string' 
      ? Number(params.value)
      : params.value;
    
    console.log(`Recording stat: ${params.stat_type} with value ${numericValue} (original: ${params.value}) for player ${params.player_id}`);
    
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: params.game_id,
      p_player_id: params.player_id,
      p_stat_type: params.stat_type,
      p_period: params.period,
      p_value: numericValue,
      p_details: params.details || ''
    });
    
    if (error) {
      console.error('Error creating game stat:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in createGameStat:', error);
    return false;
  }
};
