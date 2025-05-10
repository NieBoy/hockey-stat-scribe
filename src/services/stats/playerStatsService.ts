import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

// Function to fetch player stats by player ID
export async function getPlayerStats(playerId: string): Promise<PlayerStat[]> {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);

    if (error) {
      console.error('Error getting player stats:', error);
      throw error;
    }

    // Normalize stats to match our type definition
    return data.map(stat => ({
      id: stat.id,
      player_id: stat.player_id,
      playerId: stat.player_id,
      stat_type: stat.stat_type,
      statType: stat.stat_type,
      value: stat.value,
      games_played: stat.games_played,
      gamesPlayed: stat.games_played,
      playerName: stat.playerName || '',
      details: stat.details || ''
    }));
  } catch (error) {
    console.error('Error in getPlayerStats:', error);
    throw error;
  }
}

// Function to refresh player stats by aggregating raw game stats
export async function refreshPlayerStats(playerId: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('refresh_player_stats', {
      target_player_id: playerId,
    });

    if (error) {
      console.error('Error refreshing player stats:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in refreshPlayerStats:', error);
    throw error;
  }
}
