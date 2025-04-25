
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";
import { validateMultiplePlayers, validatePlayerId } from "@/services/events/shared/validatePlayer";

/**
 * Inserts a new game stat
 * @param stat The stat to insert (without id and timestamp)
 */
export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>): Promise<GameStat | null> => {
  try {
    // Validate that player_id exists in team_members before insertion
    const isValid = await validatePlayerId(stat.playerId);
    if (!isValid) {
      throw new Error(`Invalid player ID: ${stat.playerId} - not found in team_members table`);
    }
    
    // Use RPC call to record_game_stat function for better error handling
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: stat.playerId,
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });
    
    if (error) throw error;
    
    return data as GameStat;
  } catch (error) {
    console.error("Error inserting game stat:", error);
    return null;
  }
};

/**
 * Records plus/minus stats for multiple players
 * @param gameId Game ID
 * @param playerIds Array of team_member.id values
 * @param period Game period
 * @param isPlus Whether it's a plus (+1) or minus (-1)
 */
export const recordPlusMinusStats = async (
  gameId: string, 
  playerIds: string[], 
  period: number,
  isPlus: boolean
): Promise<boolean> => {
  if (!playerIds.length) return false;
  
  try {
    // Validate all player IDs first
    const areValid = await validateMultiplePlayers(playerIds);
    if (!areValid) {
      throw new Error(`One or more invalid player IDs provided`);
    }
    
    const value = 1; // Always 1 for plus/minus, the sign is in the details
    const details = isPlus ? 'plus' : 'minus';
    
    // Create plus/minus stats for each player
    const promises = playerIds.map(playerId => 
      insertGameStat({
        gameId,
        playerId,
        statType: 'plusMinus',
        period,
        value,
        details
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error recording plus/minus stats:", error);
    return false;
  }
};
