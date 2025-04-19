
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
  console.log("Fetching game stats for game:", gameId);

  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('game_id', gameId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error("Error fetching game stats:", error);
    throw error;
  }

  console.log("Raw game stats data:", data);

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

// Add a helper function to record plus/minus for multiple players
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

  try {
    // We need to handle each player individually to prevent failures
    const statsPromises = playerIds.map(async (playerId) => {
      try {
        const { error } = await supabase
          .from('game_stats')
          .insert({
            game_id: gameId,
            player_id: playerId,
            stat_type: 'plusMinus' as StatType,
            period: period,
            value: isPlus ? 1 : -1,
            details: isPlus ? 'plus' : 'minus',
            timestamp: new Date().toISOString()
          });
          
        if (error) {
          console.error(`Error recording ${isPlus ? 'plus' : 'minus'} for player ${playerId}:`, error);
        }
      } catch (playerError) {
        console.error(`Failed to process player ${playerId}:`, playerError);
      }
    });
    
    // Wait for all promises to settle, but don't fail if some fail
    await Promise.allSettled(statsPromises);
    
  } catch (error) {
    console.error("Error in recordPlusMinusStats:", error);
    // Don't throw, let other operations continue
  }
};
