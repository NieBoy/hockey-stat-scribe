import { supabase } from '@/lib/supabase';
import { GameStat, StatType } from '@/types';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: stat.playerId,
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });

  if (error) throw error;
  return data;
};

export const fetchGameStats = async (gameId: string, playerId?: string): Promise<GameStat[]> => {
  console.log("Fetching game stats for game:", gameId, "player:", playerId || "all");

  let query = supabase
    .from('game_stats')
    .select('*');
  
  // If gameId is a UUID, fetch by game_id; otherwise, assume it's a playerId
  if (playerId) {
    query = query.eq('player_id', playerId);
  } else {
    query = query.eq('game_id', gameId);
  }

  const { data, error } = await query.order('timestamp', { ascending: true });

  if (error) {
    console.error("Error fetching game stats:", error);
    throw error;
  }

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

// Add a helper function to record plus/minus for multiple players at once
export const recordPlusMinusStats = async (
  gameId: string, 
  playerIds: string[], 
  period: number, 
  isPlus: boolean
) => {
  // Check if we have any players to record stats for
  if (playerIds.length === 0) {
    console.log("No players provided for plus/minus stats");
    return;
  }

  console.log(`Recording ${isPlus ? '+' : '-'} for ${playerIds.length} players:`, playerIds);
  
  try {
    // Use batch processing with the RPC function
    const batchPromises = playerIds.map(playerId => 
      supabase.rpc('record_game_stat', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_stat_type: 'plusMinus',
        p_period: period,
        p_value: isPlus ? 1 : -1,
        p_details: isPlus ? 'plus' : 'minus'
      })
    );
    
    // Execute all stat recordings in parallel
    const results = await Promise.allSettled(batchPromises);
    
    // Check for errors
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
      console.error(`${errors.length} errors occurred while recording plus/minus stats:`, errors);
    }
  } catch (error) {
    console.error("Error in recordPlusMinusStats:", error);
  }
};
