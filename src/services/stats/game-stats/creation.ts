
import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    // Use either format of property names, prioritizing standard ones
    const game_id = stat.game_id || stat.gameId;
    const player_id = stat.player_id || stat.playerId;
    const stat_type = stat.stat_type || stat.statType;
    
    if (!game_id || !player_id || !stat_type) {
      throw new Error("Missing required properties for game stat");
    }
    
    // No need to lookup user_id - we'll directly use the team_member.id
    // This is the key change - we're recording stats directly for team members
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: game_id,
      p_player_id: player_id, // Using team_member.id directly
      p_stat_type: stat_type,
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
        game_id: gameId,
        player_id: playerId, // Using team_member.id directly
        stat_type: 'plusMinus',
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
