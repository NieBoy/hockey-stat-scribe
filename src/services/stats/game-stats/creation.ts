
import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';
import { calculatePlusMinus } from './plusMinus';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    // First verify that the player exists
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('id', stat.playerId);
      
    if (!count) {
      console.error(`Player ID ${stat.playerId} does not exist in team_members table`);
      throw new Error(`Player ID ${stat.playerId} does not exist`);
    }
    
    // Use RPC instead of direct insert to ensure timestamp is properly set
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: stat.playerId,
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });
    
    if (error) {
      console.error("Error inserting game stat:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in insertGameStat:", error);
    throw error;
  }
};

export const recordPlusMinusStats = async (
  gameId: string,
  playerIds: string[],
  period: number,
  isPositive: boolean
) => {
  try {
    console.log(`Recording ${isPositive ? 'plus' : 'minus'} for players:`, playerIds);
    
    // First verify that all players exist
    const { data: validPlayers, error: validationError } = await supabase
      .from('team_members')
      .select('id')
      .in('id', playerIds);
      
    if (validationError) {
      console.error("Error validating players:", validationError);
      throw new Error("Failed to validate players");
    }
    
    const validPlayerIds = validPlayers.map(p => p.id);
    const invalidPlayers = playerIds.filter(id => !validPlayerIds.includes(id));
    
    if (invalidPlayers.length > 0) {
      console.error("Invalid player IDs for plus/minus:", invalidPlayers);
      console.log("Will only record stats for valid players:", validPlayerIds);
      // Continue with only valid players
      playerIds = validPlayerIds;
    }
    
    if (playerIds.length === 0) {
      console.warn("No valid players to record plus/minus stats for");
      return false;
    }
    
    const statPromises = playerIds.map(playerId => 
      insertGameStat({
        gameId,
        playerId,
        statType: 'plusMinus',
        period,
        value: 1,
        details: isPositive ? 'plus' : 'minus'
      })
    );
    
    await Promise.all(statPromises);
    console.log(`Successfully recorded ${isPositive ? 'plus' : 'minus'} stats for ${playerIds.length} players`);
    return true;
  } catch (error) {
    console.error("Error recording plus/minus stats:", error);
    throw error;
  }
};
