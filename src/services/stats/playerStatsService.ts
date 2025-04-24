
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { refreshPlayerStats as coreRefreshStats } from "./core/statsRefresh";

/**
 * Fetches player stats by player ID
 * @param playerId The team_member.id (not user.id) of the player
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      return [];
    }
    
    return data?.map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played,
      details: ''
    })) || [];
  } catch (error) {
    console.error(`Error in fetchPlayerStats for player ${playerId}:`, error);
    return [];
  }
};

/**
 * Refreshes player stats
 * @param playerId The team_member.id (not user.id) of the player, or 'all' for all players
 * @returns Promise<Record<string, string>> Status of refresh by player ID
 */
export const refreshPlayerStats = async (playerId: string): Promise<Record<string, string>> => {
  try {
    return await coreRefreshStats(playerId);
  } catch (error) {
    console.error(`Error refreshing stats for player ${playerId}:`, error);
    if (playerId === 'all') {
      return { 'all': 'Failed' };
    }
    return { [playerId]: 'Failed' };
  }
};

/**
 * Fetches all raw game stats for a player
 * @param playerId The team_member.id (not user.id) of the player
 */
export const fetchPlayerRawGameStats = async (playerId: string) => {
  try {
    const { data, error } = await supabase
      .from('game_stats')
      .select('*, games!game_stats_game_id_fkey(id, home_team_id, away_team_id, date)')
      .eq('player_id', playerId);
      
    if (error) {
      console.error(`Error fetching raw game stats for player ${playerId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error in fetchPlayerRawGameStats for player ${playerId}:`, error);
    return [];
  }
};
