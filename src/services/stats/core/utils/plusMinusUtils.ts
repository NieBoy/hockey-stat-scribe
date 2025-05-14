
import { supabase } from '@/lib/supabase';

/**
 * Calculates if an event should be recorded as a plus or minus for a player
 * Returns +1 for a "plus" event (player's team scored)
 * Returns -1 for a "minus" event (opponent's team scored)
 */
export const calculatePlusMinusValue = async (
  gameId: string, 
  playerId: string, 
  scoringTeamType: 'home' | 'away'
): Promise<number> => {
  try {
    // Get player's team info
    const { data: playerTeam, error: playerError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError || !playerTeam) {
      console.error(`Could not find team for player ${playerId}:`, playerError);
      return 0;
    }
    
    // Get game info to determine if it's a plus or minus
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    if (gameError || !game) {
      console.error(`Could not find game ${gameId}:`, gameError);
      return 0;
    }
    
    const isHomeTeam = playerTeam.team_id === game.home_team_id;
    const isHomeTeamScored = scoringTeamType === 'home';
    
    console.log(`Plus/minus calculation:
      - Player team ID: ${playerTeam.team_id}
      - Home team ID: ${game.home_team_id}
      - Away team ID: ${game.away_team_id}
      - Is player on home team? ${isHomeTeam}
      - Did home team score? ${isHomeTeamScored}
    `);
    
    // If player's team scored, it's a "plus" (+1)
    // If opponent's team scored, it's a "minus" (-1)
    const plusMinusValue = (isHomeTeam === isHomeTeamScored) ? 1 : -1;
    
    console.log(`Plus/minus result for player ${playerId}: ${plusMinusValue}`);
    
    return plusMinusValue;
  } catch (error) {
    console.error("Error calculating plus/minus:", error);
    return 0;
  }
};

/**
 * Records a plus/minus stat directly with a numeric value
 */
export const recordPlusMinus = async (
  gameId: string, 
  playerId: string, 
  period: number,
  value: number
): Promise<boolean> => {
  try {
    // Use the createGameStat function to record the plus/minus with the direct value
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: gameId,
      p_player_id: playerId,
      p_stat_type: 'plusMinus',
      p_period: period,
      p_value: value,
      p_details: value > 0 ? 'plus event' : 'minus event'
    });
    
    if (error) {
      console.error(`Error recording plus/minus stat:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in recordPlusMinus:", error);
    return false;
  }
};
