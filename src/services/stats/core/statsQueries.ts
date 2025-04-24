
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("Fetching player stats for team_member.id:", playerId);
  
  try {
    // First get player name
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .maybeSingle();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    const playerName = playerData?.name || 'Unknown Player';
    
    // Fetch player stats
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (statsError) {
      console.error("Error fetching player stats:", statsError);
      throw statsError;
    }
    
    console.log(`Found ${stats?.length || 0} stats for player ${playerId}`);
    
    // Format and return the stats
    return (stats || []).map(stat => ({
      id: stat.id,
      playerId: stat.player_id,
      playerName: playerName,
      statType: stat.stat_type,
      value: stat.value,
      gamesPlayed: stat.games_played,
      details: ''
    }));
  } catch (error) {
    console.error("Error in fetchPlayerStats:", error);
    throw error;
  }
};
