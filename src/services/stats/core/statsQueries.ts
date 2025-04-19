
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
    // Let's check if we have any game stats at all first
    const { data: gameStatsCount, error: countError } = await supabase
      .from('game_stats')
      .select('id', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error checking game stats count:", countError);
    } else {
      console.log(`Total game stats in database: ${gameStatsCount?.length || 0}`);
    }
    
    // Now let's get the player_stats which should have been aggregated
    const { data: playerStats, error: statsError } = await supabase
      .from('player_stats')
      .select('*');
      
    if (statsError) {
      console.error("Error fetching player_stats:", statsError);
      throw statsError;
    }
    
    console.log("Raw player_stats:", playerStats);
    
    if (!playerStats || playerStats.length === 0) {
      console.log("No player_stats found, will try to recalculate from game_stats");
      
      // If there are no player_stats, let's get data from game_stats instead
      const { data: gameStats, error: gameStatsError } = await supabase
        .from('game_stats')
        .select('*');

      if (gameStatsError) {
        console.error("Error fetching game stats:", gameStatsError);
        throw gameStatsError;
      }

      console.log("Raw game stats:", gameStats);

      if (!gameStats || gameStats.length === 0) {
        console.log("No game stats found either");
        return [];
      }

      // Get all unique player IDs from game stats
      const playerIds = [...new Set(gameStats.map(stat => stat.player_id))];
      console.log("Unique player IDs:", playerIds);

      // Fetch player names in a separate query
      const { data: players, error: playersError } = await supabase
        .from('team_members')
        .select('id, name')
        .in('id', playerIds);
        
      if (playersError) {
        console.error("Error fetching player names:", playersError);
      }
      
      // Create a map of player IDs to names
      const playerNameMap = new Map();
      players?.forEach(player => {
        playerNameMap.set(player.id, player.name);
      });
      
      console.log("Player name map:", Object.fromEntries(playerNameMap));

      // Define the type for our stats accumulator
      interface StatAccumulator {
        playerId: string;
        playerName: string;
        statType: StatType;
        value: number;
        gamesPlayed: Set<string>;
      }

      // Group stats by player and stat type with proper typing
      const statsByPlayer = gameStats.reduce((acc: Record<string, StatAccumulator>, stat: any) => {
        const key = `${stat.player_id}-${stat.stat_type}`;
        if (!acc[key]) {
          acc[key] = {
            playerId: stat.player_id,
            playerName: playerNameMap.get(stat.player_id) || 'Unknown Player',
            statType: stat.stat_type as StatType,
            value: 0,
            gamesPlayed: new Set()
          };
        }
        acc[key].value += stat.value;
        acc[key].gamesPlayed.add(stat.game_id);
        return acc;
      }, {});

      console.log("Aggregated stats by player:", statsByPlayer);

      // Convert to array and format with proper typing
      const aggregatedStats: PlayerStat[] = Object.values(statsByPlayer).map((stat: StatAccumulator) => ({
        playerId: stat.playerId,
        playerName: stat.playerName,
        statType: stat.statType,
        value: stat.value,
        gamesPlayed: stat.gamesPlayed.size
      }));

      console.log("Final aggregated stats:", aggregatedStats);
      return aggregatedStats;
    }
    
    // If we have player_stats, let's fetch the player names
    const playerIds = [...new Set(playerStats.map(stat => stat.player_id))];
    
    const { data: players, error: playersError } = await supabase
      .from('team_members')
      .select('id, name')
      .in('id', playerIds);
      
    if (playersError) {
      console.error("Error fetching player names:", playersError);
    }
    
    // Create a map of player IDs to names
    const playerNameMap = new Map();
    players?.forEach(player => {
      playerNameMap.set(player.id, player.name);
    });
    
    // Map the player_stats with player names
    const mappedStats: PlayerStat[] = playerStats.map(stat => ({
      playerId: stat.player_id,
      playerName: playerNameMap.get(stat.player_id) || 'Unknown Player',
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
    
    return mappedStats;
  } catch (error) {
    console.error("Error in fetchAllPlayerStats:", error);
    return [];
  }
};
