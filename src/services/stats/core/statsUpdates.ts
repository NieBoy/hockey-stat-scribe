
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
  try {
    const { data: playerData } = await supabase
      .from('team_members')
      .select('name')
      .eq('id', playerId)
      .single();
      
    const playerName = playerData?.name || 'Unknown Player';
    
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
    
    // Calculate stats summary by type
    const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
    gameStats.forEach(stat => {
      const statType = stat.stat_type;
      const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
      
      currentStat.value += stat.value;
      currentStat.games.add(stat.game_id);
      
      statsSummary.set(statType, currentStat);
    });
    
    // Convert to PlayerStat array and update database
    const playerStats: PlayerStat[] = [];
    
    for (const [statType, data] of statsSummary.entries()) {
      const stat = {
        playerId,
        statType: statType as StatType, // Cast the string to StatType
        value: data.value,
        gamesPlayed: data.games.size,
        playerName
      };
      
      await updateOrInsertStat(playerId, stat);
      playerStats.push(stat as PlayerStat); // Cast to PlayerStat
    }
    
    return playerStats;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
