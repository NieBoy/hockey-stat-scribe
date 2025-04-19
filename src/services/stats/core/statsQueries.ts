
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

const mapStatData = (stat: any, playerName: string): PlayerStat => ({
  playerId: stat.player_id,
  statType: stat.stat_type as StatType,
  value: stat.value,
  gamesPlayed: stat.games_played,
  playerName
});

export const fetchPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    // Get player info first
    const { data: playerData } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .single();
      
    const playerName = playerData?.name || 'Unknown Player';
    
    const { data: stats, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) throw error;
    
    return stats?.map(stat => mapStatData(stat, playerName)) || [];
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
};

export const fetchAllPlayerStats = async (): Promise<PlayerStat[]> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*, team_members!player_stats_player_id_fkey(name)')
      .order('value', { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(stat => {
      const playerName = stat.team_members ? stat.team_members.name : 'Unknown Player';
      return mapStatData(stat, playerName);
    });
  } catch (error) {
    console.error("Error fetching all player stats:", error);
    return [];
  }
};
