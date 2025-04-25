
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

/**
 * Fetches all game stats for a specific game
 * @param gameId ID of the game
 * @returns Promise<GameStat[]> Array of game stats
 */
export const fetchGameStats = async (gameId: string): Promise<GameStat[]> => {
  try {
    const { data, error } = await supabase
      .from('game_stats')
      .select(`
        *,
        team_members!game_stats_player_id_fkey(name, position)
      `)
      .eq('game_id', gameId);
      
    if (error) throw error;
    
    return data.map(stat => ({
      id: stat.id,
      gameId: stat.game_id,
      game_id: stat.game_id,
      playerId: stat.player_id,
      player_id: stat.player_id,
      playerName: stat.team_members?.name || 'Unknown Player',
      statType: stat.stat_type,
      stat_type: stat.stat_type,
      period: stat.period,
      timestamp: stat.timestamp,
      value: stat.value,
      details: stat.details || ''
    }));
  } catch (error) {
    console.error(`Error fetching game stats for game ${gameId}:`, error);
    return [];
  }
};

/**
 * Deletes a game stat by ID
 * @param statId ID of the stat to delete
 */
export const deleteGameStat = async (statId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('game_stats')
      .delete()
      .eq('id', statId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting game stat ${statId}:`, error);
    return false;
  }
};

/**
 * Fetches raw game stats for a specific player
 * @param playerId The team_member.id of the player
 */
export const fetchPlayerRawGameStats = async (playerId: string) => {
  try {
    console.log('Fetching raw game stats for player:', playerId);
    
    // Fixed query - using proper table aliasing to avoid ambiguous column references
    const { data, error } = await supabase
      .from('game_stats')
      .select(`
        id,
        game_id,
        player_id,
        period,
        value,
        stat_type,
        details,
        timestamp,
        games:game_id(
          id,
          home_team_id,
          away_team_id,
          date
        )
      `)
      .eq('player_id', playerId);
      
    if (error) {
      console.error('Error fetching raw game stats:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} raw game stats for player`);
    return data || [];
  } catch (error) {
    console.error(`Error fetching raw game stats for player ${playerId}:`, error);
    return [];
  }
};
