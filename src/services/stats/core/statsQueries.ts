
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { normalizePlayerStat } from "@/utils/statNormalizer";

/**
 * Fetches player stats for a specific player
 * @param playerId The team_member.id of the player
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    console.log(`Fetching stats for player_id (team_member.id): ${playerId}`);
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('id', playerId)
      .maybeSingle();
      
    if (playerError) throw playerError;
    if (!playerData) throw new Error(`Player not found: ${playerId}`);
    
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) throw error;
    
    // Normalize the stats to include both snake_case and camelCase properties
    return (data || []).map(stat => normalizePlayerStat({
      id: stat.id,
      player_id: stat.player_id,
      playerName: playerData.name,
      stat_type: stat.stat_type,
      value: stat.value,
      games_played: stat.games_played
    }));
  } catch (error) {
    console.error(`Error fetching player stats:`, error);
    throw error;
  }
};

/**
 * Fetches stats for all players
 * @returns Promise<PlayerStat[]> Array of player stats
 */
export const fetchAllPlayerStats = async (): Promise<PlayerStat[]> => {
  try {
    console.log(`Fetching stats for all players`);
    const { data, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        team_members!player_stats_player_id_fkey (
          name,
          role,
          team_id
        )
      `);
      
    if (error) throw error;
    
    // Normalize stats to include both snake_case and camelCase properties
    return (data || []).map(stat => normalizePlayerStat({
      id: stat.id,
      player_id: stat.player_id,
      playerName: stat.team_members?.name,
      stat_type: stat.stat_type,
      value: stat.value,
      games_played: stat.games_played
    }));
  } catch (error) {
    console.error(`Error fetching all player stats:`, error);
    throw error;
  }
};

/**
 * Validates player stats using the database function
 * @param playerId The team_member.id of the player
 * @returns Promise<any> Validation result
 */
export const validatePlayerStats = async (playerId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .rpc('validate_player_stats', { player_id: playerId });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error validating player stats:`, error);
    throw error;
  }
};
