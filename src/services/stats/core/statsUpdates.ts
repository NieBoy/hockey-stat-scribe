
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

const updateOrInsertStat = async (
  playerId: string, 
  stat: Partial<PlayerStat>
) => {
  const { data: existingStat } = await supabase
    .from('player_stats')
    .select('id')
    .eq('player_id', playerId)
    .eq('stat_type', stat.statType)
    .maybeSingle();
    
  if (existingStat) {
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
      return [];
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
    
    console.log("Raw game stats for player:", gameStats);
    
    // If there are no game stats for this player, let's see if there are ANY game stats in the database
    if (!gameStats || gameStats.length === 0) {
      const { count, error: countError } = await supabase
        .from('game_stats')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error counting game stats:", countError);
      } else {
        console.log("Total game stats in database:", count);
      }
      
      // Also check games this player might be part of
      const { data: playerGames, error: playerGamesError } = await supabase
        .from('games')
        .select('id, home_team_id, away_team_id')
        .or(`home_team_id.eq.${playerData.team_id},away_team_id.eq.${playerData.team_id}`);
        
      if (playerGamesError) {
        console.error("Error checking player games:", playerGamesError);
      } else {
        console.log("Games for player's team:", playerGames);
      }
      
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
    
    console.log("Stats summary:", Object.fromEntries(statsSummary));
    
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
      
      await updateOrInsertStat(playerId, stat);
      playerStats.push(stat as PlayerStat);
    }
    
    console.log("Final processed stats:", playerStats);
    return playerStats;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
