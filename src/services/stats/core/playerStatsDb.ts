
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";
import { validatePlayerId } from "@/services/events/shared/validatePlayer";
import { normalizePlayerStat } from "@/utils/statNormalizer";

/**
 * Updates or inserts a player stat record
 * @param playerId The team_member.id (not user.id) of the player
 * @param stat Stat data to update or insert
 * @returns Success status
 */
export const updateOrInsertStat = async (
  playerId: string,
  stat: Partial<PlayerStat>
): Promise<boolean> => {
  try {
    // First validate that the player exists in team_members table
    const isValid = await validatePlayerId(playerId);
    if (!isValid) {
      console.error(`Cannot update/insert stat: Player ID ${playerId} not found in team_members table`);
      return false;
    }
    
    console.log(`Upserting stat for player ${playerId}:`, stat);
    
    // Ensure value is numeric
    const numericValue = typeof stat.value === 'string' ? Number(stat.value) : stat.value || 0;
    const gamesPlayed = typeof stat.gamesPlayed === 'string' ? Number(stat.gamesPlayed) : stat.gamesPlayed || 0;
    
    const { data, error } = await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,  // Using team_member.id consistently
        stat_type: stat.statType || stat.stat_type,
        value: numericValue,
        games_played: gamesPlayed
      }, {
        onConflict: 'player_id,stat_type'
      });

    if (error) {
      console.error("Error upserting player stat:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateOrInsertStat:", error);
    return false;
  }
};

/**
 * Gets stats for a player
 * @param playerId The team_member.id (not user.id) of the player
 * @returns Array of player stats
 */
export const getPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    // Validate player ID
    const isValid = await validatePlayerId(playerId);
    if (!isValid) {
      console.error(`Cannot get stats: Player ID ${playerId} not found in team_members table`);
      return [];
    }
    
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) {
      console.error(`Error fetching stats for player ${playerId}:`, error);
      return [];
    }
    
    // Normalize the data format to include both snake_case and camelCase properties
    return data?.map(stat => normalizePlayerStat({
      id: stat.id,
      player_id: stat.player_id,
      stat_type: stat.stat_type,
      value: stat.value,
      games_played: stat.games_played,
      details: stat.details || ''
    })) || [];
  } catch (error) {
    console.error(`Error in getPlayerStats for ${playerId}:`, error);
    return [];
  }
};
