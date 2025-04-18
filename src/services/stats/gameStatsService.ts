
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

  // Verify each player ID exists before trying to insert stats
  try {
    const { data: existingPlayers, error: playerCheckError } = await supabase
      .from('users')
      .select('id')
      .in('id', playerIds);

    if (playerCheckError) {
      console.error("Error checking player existence:", playerCheckError);
      throw new Error(`Failed to verify player IDs: ${playerCheckError.message}`);
    }

    // Filter out any player IDs that don't exist in the database
    const validPlayerIds = existingPlayers?.map(p => p.id) || [];
    
    if (validPlayerIds.length === 0) {
      console.warn("None of the provided player IDs exist in the database");
      return;
    }

    // Only insert stats for valid players
    const statsToInsert = validPlayerIds.map(playerId => ({
      game_id: gameId,
      player_id: playerId,
      stat_type: 'plusMinus' as StatType,
      period: period,
      value: isPlus ? 1 : -1,
      details: isPlus ? 'plus' : 'minus',
      timestamp: new Date().toISOString()
    }));
  
    if (statsToInsert.length === 0) return;
    
    const { error } = await supabase
      .from('game_stats')
      .insert(statsToInsert);
      
    if (error) {
      console.error("Error recording plus/minus stats:", error);
      throw new Error(`Failed to record plus/minus stats: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in recordPlusMinusStats:", error);
    throw error;
  }
};
