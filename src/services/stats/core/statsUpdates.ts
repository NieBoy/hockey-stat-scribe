
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

const updateOrInsertStat = async (
  playerId: string, 
  stat: Partial<PlayerStat>
) => {
  try {
    console.log(`Updating/inserting stat for player ${playerId}:`, stat);
    
    const { data: existingStat } = await supabase
      .from('player_stats')
      .select('id')
      .eq('player_id', playerId)
      .eq('stat_type', stat.statType)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Found existing stat with id ${existingStat.id}, updating...`);
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          value: stat.value,
          games_played: stat.gamesPlayed
        })
        .eq('id', existingStat.id);
        
      if (updateError) {
        console.error("Error updating player stat:", updateError);
        throw updateError;
      }
      
      console.log(`Successfully updated stat id ${existingStat.id}`);
    } else {
      console.log(`No existing stat found, inserting new stat...`);
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
        throw insertError;
      }
      
      console.log(`Successfully inserted new stat for player ${playerId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateOrInsertStat for player ${playerId}:`, error);
    return false;
  }
};

export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("refreshPlayerStats called for player:", playerId);
  try {
    // First, get player details to ensure we have a valid player
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('name, team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    const playerName = playerData?.name || 'Unknown Player';
    console.log("Found player:", playerName, "team_id:", playerData.team_id);
    
    // Query the game_stats table for this player specifically
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('stat_type, value, game_id, period, details')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    console.log(`Found ${gameStats?.length || 0} raw game stats for player:`, gameStats);
    
    // If there are no game stats for this player, return empty array
    if (!gameStats || gameStats.length === 0) {
      console.log("No game stats found for player:", playerId);
      return [];
    }
    
    // Calculate stats summary by type
    const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
    gameStats.forEach(stat => {
      const statType = stat.stat_type;
      if (!statType) {
        console.warn("Ignoring stat with undefined stat_type:", stat);
        return;
      }
      
      const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
      
      currentStat.value += stat.value;
      currentStat.games.add(stat.game_id);
      
      statsSummary.set(statType, currentStat);
    });
    
    console.log("Stats summary:", Array.from(statsSummary.entries()).map(([key, val]) => 
      `${key}: ${val.value} (${val.games.size} games)`
    ));
    
    // Convert to PlayerStat array and update database
    const playerStats: PlayerStat[] = [];
    
    for (const [statType, data] of statsSummary.entries()) {
      const stat = {
        playerId,
        statType: statType as StatType,
        value: data.value,
        gamesPlayed: data.games.size,
        playerName
      };
      
      const updated = await updateOrInsertStat(playerId, stat);
      if (updated) {
        playerStats.push(stat as PlayerStat);
      }
    }
    
    console.log("Final processed stats:", playerStats);
    return playerStats;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
