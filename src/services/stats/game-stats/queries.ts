
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
