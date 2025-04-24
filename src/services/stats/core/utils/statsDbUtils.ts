
import { supabase } from "@/lib/supabase";
import { validatePlayerId } from "@/services/events/shared/validatePlayer";

/**
 * Creates a game stat record in the database
 */
export const createGameStat = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  details: string = ''
): Promise<boolean> => {
  try {
    console.log(`Creating game stat: ${statType} for player ${playerId} in period ${period}, game ${gameId}`);
    
    // Validate that player ID exists in team_members
    const isValid = await validatePlayerId(playerId);
    if (!isValid) {
      console.error(`Cannot create stat: Player ID ${playerId} not found in team_members table`);
      return false;
    }
    
    // First check if stat already exists
    const { data: existingStat } = await supabase
      .from('game_stats')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .eq('stat_type', statType)
      .eq('period', period)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Stat already exists for ${statType} in period ${period}`);
      return true;
    }
    
    // Create new stat using RPC function for maximum compatibility
    try {
      const { data, error } = await supabase.rpc('record_game_stat', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_stat_type: statType,
        p_period: period,
        p_value: 1,
        p_details: details
      });
      
      if (error) {
        console.error(`Error creating ${statType} stat using RPC:`, error);
        throw error;
      }
      
      console.log(`Successfully created ${statType} stat for player ${playerId} using RPC`);
      return true;
    } catch (rpcError) {
      console.error(`RPC failed, trying direct insert:`, rpcError);
      
      // Fallback to direct insert if RPC fails
      const { error } = await supabase
        .from('game_stats')
        .insert({
          game_id: gameId,
          player_id: playerId,
          stat_type: statType,
          period: period,
          value: 1,
          details: details,
          timestamp: new Date().toISOString()
        });
        
      if (error) {
        console.error(`Error creating ${statType} stat:`, error);
        return false;
      }
      
      console.log(`Successfully created ${statType} stat for player ${playerId}`);
      return true;
    }
  } catch (error) {
    console.error(`Error in createGameStat:`, error);
    return false;
  }
};

export const getPlayerTeam = async (playerId: string) => {
  try {
    const { data: playerTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
      .single();
      
    return playerTeam;
  } catch (error) {
    console.error(`Error fetching player team:`, error);
    return null;
  }
};

export const getGameTeams = async (gameId: string) => {
  try {
    const { data: game } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    return game;
  } catch (error) {
    console.error(`Error fetching game:`, error);
    return null;
  }
};
