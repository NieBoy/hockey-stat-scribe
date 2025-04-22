
import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    // No need to lookup user_id - we'll directly use the team_member.id
    // This is the key change - we're recording stats directly for team members
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: stat.playerId, // Using team_member.id directly
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });
    
    if (error) {
      console.error("Error inserting game stat:", error);
      throw error;
    }
    
    console.log("Successfully inserted game stat");
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
    
    // No user_id validation required - we'll use team_member.id directly
    const statPromises = playerIds.map(playerId => 
      insertGameStat({
        gameId,
        playerId, // Using team_member.id directly
        statType: 'plusMinus',
        period,
        value: isPositive ? 1 : -1,
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
