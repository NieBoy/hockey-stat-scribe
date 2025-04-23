
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('game_stats')
    .insert({
      game_id: stat.gameId || stat.game_id,
      player_id: stat.playerId || stat.player_id,
      stat_type: stat.statType || stat.stat_type,
      period: stat.period,
      value: stat.value,
      details: stat.details,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const recordPlusMinusStats = async (
  gameId: string,
  teamType: 'home' | 'away',
  playerIds: string[],
  period: number,
  isPlus: boolean
) => {
  try {
    const insertPromises = playerIds.map(playerId => 
      supabase
        .from('game_stats')
        .insert({
          game_id: gameId,
          player_id: playerId,
          stat_type: 'plusMinus',
          period: period,
          value: isPlus ? 1 : -1,
          details: isPlus ? 'plus' : 'minus',
          timestamp: new Date().toISOString()
        })
    );
    
    await Promise.all(insertPromises);
    return true;
  } catch (error) {
    console.error('Error recording plus/minus stats:', error);
    return false;
  }
};
