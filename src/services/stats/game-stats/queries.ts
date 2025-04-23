
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

export const fetchGameStats = async (gameId?: string, playerId?: string): Promise<GameStat[]> => {
  try {
    let query = supabase
      .from('game_stats')
      .select('*');
      
    if (gameId) {
      query = query.eq('game_id', gameId);
    }
    
    if (playerId) {
      query = query.eq('player_id', playerId);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    // Map to standard format
    return (data || []).map(stat => ({
      id: stat.id,
      game_id: stat.game_id,
      gameId: stat.game_id,
      player_id: stat.player_id,
      playerId: stat.player_id,
      stat_type: stat.stat_type,
      statType: stat.stat_type,
      period: stat.period,
      value: stat.value,
      details: stat.details,
      timestamp: stat.timestamp
    }));
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return [];
  }
};

export const deleteGameStat = async (statId: string) => {
  const { error } = await supabase
    .from('game_stats')
    .delete()
    .eq('id', statId);
    
  if (error) throw error;
  return true;
};
