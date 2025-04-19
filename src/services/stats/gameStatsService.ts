import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';

export const fetchGameStats = async (gameId: string, playerId?: string): Promise<GameStat[]> => {
  try {
    console.log(`Fetching game stats for game: ${gameId || 'all'}, player: ${playerId || 'all'}`);
    
    let query = supabase.from('game_stats').select('*');
    
    if (gameId) {
      query = query.eq('game_id', gameId);
    }
    
    if (playerId) {
      query = query.eq('player_id', playerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching game stats:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} game stats`);
    
    return data?.map(stat => ({
      id: stat.id,
      gameId: stat.game_id,
      playerId: stat.player_id,
      statType: stat.stat_type,
      period: stat.period,
      timestamp: new Date(stat.timestamp),
      value: stat.value,
      details: stat.details || ''
    })) || [];
  } catch (error) {
    console.error("Error in fetchGameStats:", error);
    throw error;
  }
};

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    const { data, error } = await supabase.from('game_stats').insert({
      game_id: stat.gameId,
      player_id: stat.playerId,
      stat_type: stat.statType,
      period: stat.period,
      value: stat.value,
      details: stat.details || ''
    }).select();
    
    if (error) {
      console.error("Error inserting game stat:", error);
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error("Error in insertGameStat:", error);
    throw error;
  }
};

export const deleteGameStat = async (statId: string) => {
  try {
    const { error } = await supabase.from('game_stats').delete().eq('id', statId);
    
    if (error) {
      console.error("Error deleting game stat:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteGameStat:", error);
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
