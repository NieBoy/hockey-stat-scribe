
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      id,
      player_id,
      stat_type,
      value,
      games_played
    `);

  if (error) throw error;
  
  return data.map(stat => ({
    playerId: stat.player_id,
    statType: stat.stat_type as any,
    value: stat.value,
    gamesPlayed: stat.games_played
  }));
};

export const getStatsByPlayerId = async (playerId: string): Promise<PlayerStat[]> => {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      id,
      player_id,
      stat_type,
      value,
      games_played
    `)
    .eq('player_id', playerId);

  if (error) throw error;
  
  return data.map(stat => ({
    playerId: stat.player_id,
    statType: stat.stat_type as any,
    value: stat.value,
    gamesPlayed: stat.games_played
  }));
};
