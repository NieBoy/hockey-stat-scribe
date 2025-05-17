
import { supabase } from '@/lib/supabase';

/**
 * Standardized plus/minus values
 * Always use these constants to ensure consistency
 */
export const PLUS_EVENT_VALUE = 1;
export const MINUS_EVENT_VALUE = -1;

/**
 * Determines if a player should receive a plus or minus based on team alignment
 * Returns +1 if the player's team scored, -1 if the opponent scored
 * 
 * @param gameId The game ID
 * @param playerId The player's team_member.id
 * @param scoringTeamType The team type ('home' or 'away') that scored
 * @returns Promise<number> Either +1 or -1
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
    
    // Get game info to determine the teams
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    if (gameError || !game) {
      console.error(`Could not find game ${gameId}:`, gameError);
      return 0;
    }
    
    // Determine if player is on home team
    const isHomeTeam = playerTeam.team_id === game.home_team_id;
    
    // If player is on home team and home team scored, or
    // player is on away team and away team scored, it's a plus
    const isPlayersTeamScored = (isHomeTeam && scoringTeamType === 'home') || 
                               (!isHomeTeam && scoringTeamType === 'away');
    
    console.log(`Plus/minus calculation for ${playerId}:
      - Player team ID: ${playerTeam.team_id}
      - Game: ${gameId}
      - Home team ID: ${game.home_team_id}
      - Away team ID: ${game.away_team_id}
      - Is player on home team? ${isHomeTeam}
      - Scoring team: ${scoringTeamType}
      - Is player's team scoring? ${isPlayersTeamScored}
      - Result: ${isPlayersTeamScored ? PLUS_EVENT_VALUE : MINUS_EVENT_VALUE}
    `);
    
    return isPlayersTeamScored ? PLUS_EVENT_VALUE : MINUS_EVENT_VALUE;
  } catch (error) {
    console.error("Error calculating plus/minus value:", error);
    return 0; // Neutral value in case of error
  }
};

/**
 * Records a plus/minus stat with the standard values
 * 
 * @param gameId The game ID
 * @param playerId The player's team_member.id  
 * @param period The game period
 * @param value The plus/minus value (+1 or -1)
 * @returns Promise<boolean> Success status
 */
export const recordPlusMinus = async (
  gameId: string, 
  playerId: string, 
  period: number,
  value: number
): Promise<boolean> => {
  try {
    // Ensure value is valid
    if (value !== PLUS_EVENT_VALUE && value !== MINUS_EVENT_VALUE) {
      console.error(`Invalid plus/minus value: ${value}. Must be ${PLUS_EVENT_VALUE} or ${MINUS_EVENT_VALUE}`);
      return false;
    }
    
    // Use standardized terminology in the details
    const details = value === PLUS_EVENT_VALUE ? 'plus event' : 'minus event';
    
    // Record the stat
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: gameId,
      p_player_id: playerId,
      p_stat_type: 'plusMinus',
      p_period: period,
      p_value: value,
      p_details: details
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

/**
 * Calculates and records a plus/minus stat in a single operation
 * 
 * @param gameId The game ID
 * @param playerId The player's team_member.id
 * @param scoringTeamType The team type that scored
 * @param period The game period
 * @returns Promise<boolean> Success status
 */
export const calculateAndRecordPlusMinus = async (
  gameId: string,
  playerId: string,
  scoringTeamType: 'home' | 'away',
  period: number
): Promise<boolean> => {
  try {
    // Calculate the value
    const value = await calculatePlusMinusValue(gameId, playerId, scoringTeamType);
    
    // Record the stat with the calculated value
    return await recordPlusMinus(gameId, playerId, period, value);
  } catch (error) {
    console.error(`Error calculating and recording plus/minus for player ${playerId}:`, error);
    return false;
  }
};
