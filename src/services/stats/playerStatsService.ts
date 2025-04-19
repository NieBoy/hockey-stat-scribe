import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

/**
 * Refreshes player stats by calculating them from game_stats
 * @param playerId The ID of the player to refresh stats for
 */
export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  try {
    console.log("Refreshing player stats for:", playerId);
    
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
      
      // For debugging: Check if player has any events with this ID
      const { data: checkData, error: checkError } = await supabase
        .from('game_events')
        .select('event_type, team_type')
        .eq('created_by', playerId)
        .limit(5);
        
      if (!checkError && checkData && checkData.length > 0) {
        console.log("Found events created by this player:", checkData);
      }
      
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
      gamesPlayed: data.games.size
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
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected
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
      .select('id, player_id, stat_type, value, games_played')
      .eq('player_id', playerId);
      
    if (error) throw error;
    
    // If no stats exist or the call is specifically asking to refresh, calculate them
    if (!existingStats || existingStats.length === 0) {
      console.log("No existing stats found, refreshing player stats");
      return refreshPlayerStats(playerId);
    }
    
    // Return existing stats
    return existingStats.map(stat => ({
      playerId: stat.player_id,
      statType: stat.stat_type as StatType,
      value: stat.value,
      gamesPlayed: stat.games_played
    }));
  } catch (error) {
    console.error("Error in getPlayerStatsWithRefresh:", error);
    return [];
  }
};
