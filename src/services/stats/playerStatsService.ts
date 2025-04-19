
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

/**
 * Refreshes player stats by calculating them from game_stats
 * @param playerId The ID of the player to refresh stats for
 */
export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    console.log("Refreshing player stats for:", playerId);
    
    // First get player info for later use
    const { data: playerData } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .single();
      
    const playerName = playerData?.name || 'Unknown Player';
    
    // Get all game stats for this player
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('stat_type, value, game_id')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    if (!gameStats || gameStats.length === 0) {
      console.log("No game stats found for player:", playerId);
      return [];
    }
    
    console.log("Found game stats:", gameStats.length, gameStats);
    
    // Calculate stats summary by type
    const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
    gameStats.forEach(stat => {
      const statType = stat.stat_type;
      const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
      
      currentStat.value += stat.value;
      currentStat.games.add(stat.game_id);
      
      statsSummary.set(statType, currentStat);
    });
    
    // Convert to an array of PlayerStat objects
    const playerStats: PlayerStat[] = Array.from(statsSummary.entries()).map(([statType, data]) => ({
      playerId,
      statType: statType as StatType,
      value: data.value,
      gamesPlayed: data.games.size,
      playerName: playerName
    }));
    
    console.log("Calculated player stats:", playerStats);
    
    // Update the player_stats table
    for (const stat of playerStats) {
      // Check if this stat already exists
      const { data: existingStat, error: checkError } = await supabase
        .from('player_stats')
        .select('id')
        .eq('player_id', playerId)
        .eq('stat_type', stat.statType)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking for existing stat:", checkError);
        continue;
      }
      
      if (existingStat) {
        // Update existing stat
        console.log("Updating existing stat:", existingStat.id, stat);
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            value: stat.value,
            games_played: stat.gamesPlayed
          })
          .eq('id', existingStat.id);
          
        if (updateError) {
          console.error("Error updating player stat:", updateError);
        }
      } else {
        // Insert new stat
        console.log("Inserting new stat:", stat);
        const { error: insertError } = await supabase
          .from('player_stats')
          .insert({
            player_id: playerId,
            stat_type: stat.statType,
            value: stat.value,
            games_played: stat.gamesPlayed
          });
          
        if (insertError) {
          console.error("Error inserting player stat:", insertError);
        }
      }
    }
    
    return playerStats;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};

/**
 * Gets player stats, refreshing them if no stats are found
 */
export const getPlayerStatsWithRefresh = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    // First try to get existing stats
    const { data: existingStats, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
      
    if (error) throw error;
    
    // If no stats exist, calculate them
    if (!existingStats || existingStats.length === 0) {
      console.log("No existing stats found, refreshing player stats");
      return refreshPlayerStats(playerId);
    }
    
    // Get player name
    const { data: playerData } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .single();
      
    const playerName = playerData?.name || 'Unknown Player';
    
    // Return existing stats
    return existingStats.map(stat => ({
      playerId: stat.player_id,
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played,
      playerName: playerName
    }));
  } catch (error) {
    console.error("Error in getPlayerStatsWithRefresh:", error);
    return [];
  }
};

/**
 * Retrieves all player stats from the database
 */
export const getAllPlayerStats = async (): Promise<PlayerStat[]> => {
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
      
      return {
        playerId: stat.player_id,
        statType: stat.stat_type as StatType,
        value: stat.value,
        gamesPlayed: stat.games_played,
        playerName
      };
    });
  } catch (error) {
    console.error("Error fetching all player stats:", error);
    return [];
  }
};

/**
 * Refreshes stats for all players who have game stats recorded
 */
export const refreshAllPlayerStats = async (): Promise<void> => {
  try {
    // Get all unique player IDs with game stats 
    const { data: gameStats, error: statsError } = await supabase
      .from('game_stats')
      .select('player_id');
      
    if (statsError) throw statsError;
    
    // Process data to get unique player IDs
    const uniquePlayerIds = [...new Set(gameStats?.map(stat => stat.player_id) || [])];
    
    console.log(`Found ${uniquePlayerIds.length} players with game stats`);
    
    // Process each player's stats
    for (const playerId of uniquePlayerIds) {
      await refreshPlayerStats(playerId);
    }
    
    console.log("Successfully refreshed stats for all players");
  } catch (error) {
    console.error("Error refreshing all player stats:", error);
    throw error;
  }
};
