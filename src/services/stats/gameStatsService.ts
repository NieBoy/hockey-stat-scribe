
import { supabase } from '@/lib/supabase';
import { GameStat, StatType } from '@/types';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('game_stats')
    .insert({
      game_id: stat.gameId,
      player_id: stat.playerId,
      stat_type: stat.statType,
      period: stat.period,
      value: stat.value,
      details: stat.details || '',
      timestamp: new Date().toISOString()  // Add the current timestamp
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchGameStats = async (gameId: string): Promise<GameStat[]> => {
  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return (data || []).map(stat => ({
    id: stat.id,
    gameId: stat.game_id,
    playerId: stat.player_id,
    statType: stat.stat_type as StatType,
    period: stat.period,
    timestamp: new Date(stat.timestamp),
    value: stat.value,
    details: stat.details || ''
  }));
};

export const deleteGameStat = async (statId: string) => {
  const { error } = await supabase
    .from('game_stats')
    .delete()
    .eq('id', statId);

  if (error) throw error;
};
