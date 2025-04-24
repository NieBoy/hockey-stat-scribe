
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

/**
 * Fetches all stats for a specific game
 * @param gameId The game ID
 * @returns Promise<GameStat[]> Array of game stats
 */
export const fetchGameStats = async (gameId: string): Promise<GameStat[]> => {
  try {
    const { data, error } = await supabase
      .from('game_stats')
      .select('*, team_members!game_stats_player_id_fkey (name, team_id)')
      .eq('game_id', gameId);
      
    if (error) throw error;
    
    return (data || []).map(stat => ({
      id: stat.id,
      gameId: stat.game_id,
      game_id: stat.game_id,
      playerId: stat.player_id,
      player_id: stat.player_id,
      playerName: stat.team_members?.name,
      statType: stat.stat_type,
      stat_type: stat.stat_type,
      period: stat.period,
      value: stat.value,
      details: stat.details || '',
      timestamp: stat.timestamp
    }));
  } catch (error) {
    console.error(`Error fetching game stats for game ${gameId}:`, error);
    throw error;
  }
};

/**
 * Deletes a specific game stat entry
 * @param statId The stat ID to delete
 * @returns Promise<void>
 */
export const deleteGameStat = async (statId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('game_stats')
      .delete()
      .eq('id', statId);
      
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting game stat ${statId}:`, error);
    throw error;
  }
};

/**
 * Fetches raw game stats for a player across all games
 * Used primarily for debugging and stats validation
 * @param playerId The team_member.id of the player
 * @returns Promise<any[]> Array of raw game stats
 */
export const fetchPlayerRawGameStats = async (playerId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('game_stats')
      .select('*, games!game_stats_game_id_fkey(date, home_team_id, away_team_id)')
      .eq('player_id', playerId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching raw game stats for player ${playerId}:`, error);
    return [];
  }
};
