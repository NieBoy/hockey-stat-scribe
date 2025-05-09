
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";
import { validateMultiplePlayers, validatePlayerId } from "@/services/events/shared/validatePlayer";
import { createGameStat } from "../core/utils/statsDbUtils";

/**
 * Inserts a new game stat
 * @param stat The stat to insert (without id and timestamp)
 */
export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>): Promise<GameStat | null> => {
  try {
    // Validate that player_id exists in team_members before insertion
    const isValid = await validatePlayerId(stat.playerId || stat.player_id);
    if (!isValid) {
      throw new Error(`Invalid player ID: ${stat.playerId || stat.player_id} - not found in team_members table`);
    }
    
    // Make sure we have both gameId/game_id and playerId/player_id set
    const gameId = stat.gameId || stat.game_id;
    const playerId = stat.playerId || stat.player_id;
    const statType = stat.statType || stat.stat_type;
    
    // Convert value to number if it's a string
    const value = typeof stat.value === 'string' ? Number(stat.value) : stat.value;
    
    // Use the standardized createGameStat function
    const success = await createGameStat({
      game_id: gameId,
      player_id: playerId,
      stat_type: statType,
      period: stat.period,
      value: value,
      details: stat.details || ''
    });
    
    if (!success) return null;
    
    // Return a mock object with the data provided
    return {
      id: 'temp-id', // Will be replaced by database
      game_id: gameId,
      player_id: playerId,
      stat_type: statType,
      period: stat.period,
      value: value,
      timestamp: new Date().toISOString(),
      details: stat.details || '',
      gameId,
      playerId,
      statType
    };
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
    
    // Use the actual +1/-1 value directly
    const value = isPlus ? 1 : -1;
    
    console.log(`Recording plus/minus (${value}) for ${playerIds.length} players`);
    
    // Create plus/minus stats for each player
    const promises = playerIds.map(playerId => 
      createGameStat({
        game_id: gameId,
        player_id: playerId,
        stat_type: 'plusMinus',
        period,
        value
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error recording plus/minus stats:", error);
    return false;
  }
};
