
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

/**
 * Fetch game statistics for a specific game and/or player
 * 
 * @param gameId Optional - filter by game ID
 * @param playerId Optional - filter by player ID
 * @returns Array of game statistics
 */
export const fetchGameStats = async (
  gameId?: string,
  playerId?: string
): Promise<GameStat[]> => {
  try {
    console.log(`Fetching game stats for game: ${gameId} player: ${playerId}`);
    
    let query = supabase
      .from('game_stats')
      .select('*');
    
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
    
    if (!data || data.length === 0) {
      if (playerId) {
        // If no stats found for a specific player, check if there are any stats at all
        const { count, error: countError } = await supabase
          .from('game_stats')
          .select('*', { count: 'exact', head: true });
          
        console.log(`Total game stats in database: ${count || 0}`);
        
        if (countError) {
          console.error("Error counting total game stats:", countError);
        }
      }
    }
    
    return (data || []).map(stat => ({
      id: stat.id,
      gameId: stat.game_id,
      playerId: stat.player_id,
      statType: stat.stat_type,
      period: stat.period,
      value: stat.value,
      details: stat.details || '',
      timestamp: stat.timestamp
    }));
  } catch (error) {
    console.error("Error in fetchGameStats:", error);
    return [];
  }
};

/**
 * Add a game statistic for a player
 */
export const addGameStat = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  value: number,
  details?: string
): Promise<GameStat | null> => {
  try {
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: gameId,
      p_player_id: playerId,
      p_stat_type: statType,
      p_period: period,
      p_value: value,
      p_details: details || ''
    });
    
    if (error) {
      console.error("Error adding game stat:", error);
      throw error;
    }
    
    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      statType: data.stat_type,
      period: data.period,
      value: data.value,
      details: details || '',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error in addGameStat:", error);
    return null;
  }
};
