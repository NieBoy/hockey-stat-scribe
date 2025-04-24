
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

export const fetchAllPlayerStats = async (): Promise<PlayerStat[]> => {
  console.log("Fetching all player stats");
  
  try {
    // First, get all team members who are players
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('id, name, team_id')
      .eq('role', 'player');
    
    if (membersError) {
      console.error("Error fetching team members:", membersError);
      throw membersError;
    }

    // Fetch stats for each player
    const allPlayerStats: PlayerStat[] = [];
    
    for (const member of teamMembers || []) {
      try {
        const playerStats = await fetchPlayerStats(member.id);
        allPlayerStats.push(...playerStats);
      } catch (playerStatError) {
        console.error(`Error fetching stats for player ${member.id}:`, playerStatError);
      }
    }

    console.log(`Total stats for all players: ${allPlayerStats.length}`);
    
    return allPlayerStats;
  } catch (error) {
    console.error("Error in fetchAllPlayerStats:", error);
    throw error;
  }
};
