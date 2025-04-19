
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
  console.log("fetchPlayerStats called for player:", playerId);
  try {
    // Get player info first
    const { data: playerData } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .single();
      
    const playerName = playerData?.name || 'Unknown Player';
    console.log("Found player name:", playerName);
    
    const { data: stats, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
    
    console.log("Raw player stats:", stats);
    return stats?.map(stat => mapStatData(stat, playerName)) || [];
  } catch (error) {
    console.error("Error in fetchPlayerStats:", error);
    return [];
  }
};

export const fetchAllPlayerStats = async (): Promise<PlayerStat[]> => {
  console.log("fetchAllPlayerStats called");
  try {
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('*, team_members!game_stats_player_id_fkey(name)')
      .order('value', { ascending: false });

    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }

    console.log("Raw game stats:", gameStats);

    if (!gameStats || gameStats.length === 0) {
      console.log("No game stats found");
      return [];
    }

    // Group stats by player and stat type
    const statsByPlayer = gameStats.reduce((acc, stat) => {
      const key = `${stat.player_id}-${stat.stat_type}`;
      if (!acc[key]) {
        acc[key] = {
          playerId: stat.player_id,
          playerName: stat.team_members?.name || 'Unknown Player',
          statType: stat.stat_type,
          value: 0,
          gamesPlayed: new Set()
        };
      }
      acc[key].value += stat.value;
      acc[key].gamesPlayed.add(stat.game_id);
      return acc;
    }, {} as Record<string, any>);

    console.log("Aggregated stats by player:", statsByPlayer);

    // Convert to array and format
    const aggregatedStats = Object.values(statsByPlayer).map(stat => ({
      playerId: stat.playerId,
      playerName: stat.playerName,
      statType: stat.statType as StatType,
      value: stat.value,
      gamesPlayed: stat.gamesPlayed.size
    }));

    console.log("Final aggregated stats:", aggregatedStats);
    return aggregatedStats;
  } catch (error) {
    console.error("Error in fetchAllPlayerStats:", error);
    return [];
  }
};
