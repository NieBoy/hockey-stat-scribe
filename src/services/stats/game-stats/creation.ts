
import { supabase } from "@/lib/supabase";
import { GameStat } from "@/types";

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log(`Inserting game stat: ${stat.statType} for player ${stat.playerId || stat.player_id}`);
    
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
  } catch (error) {
    console.error("Error inserting game stat:", error);
    throw error;
  }
};

/**
 * Records plus/minus stats for players on ice during a goal
 * @param gameId Game ID
 * @param playerIds Array of team_member.id values for players on ice
 * @param period Current game period
 * @param isHomeScoringTeam Whether the home team scored
 * @param value The value to add (typically 1)
 * @returns Promise<boolean> Success status
 */
export const recordPlusMinusStats = async (
  gameId: string,
  playerIds: string[],
  period: number,
  isHomeScoringTeam: boolean,
  value: number
) => {
  try {
    console.log(`Recording plus/minus for ${playerIds.length} players, home team scoring: ${isHomeScoringTeam}`);
    
    if (!playerIds.length) {
      console.warn("No players provided for plus/minus stats");
      return true;
    }
    
    // Get game data to determine teams
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    if (gameError) {
      console.error("Error fetching game data:", gameError);
      throw gameError;
    }
    
    // Get player team information
    const { data: teamMembers, error: playerError } = await supabase
      .from('team_members')
      .select('id, team_id')
      .in('id', playerIds);
      
    if (playerError) {
      console.error("Error fetching player team data:", playerError);
      throw playerError;
    }
    
    // Insert plus/minus stats based on whether player is on the scoring team
    const insertPromises = teamMembers.map(player => {
      const isHomeTeam = player.team_id === game.home_team_id;
      
      // Determine if player gets + or -
      // Player gets + if their team scored, - if opponent scored
      const isPlusForPlayer = isHomeTeam === isHomeScoringTeam;
      const statValue = Math.abs(value); // Always use positive value (typically 1)
      const details = isPlusForPlayer ? 'plus' : 'minus';
      
      console.log(`Player ${player.id}: team ${player.team_id}, isHomeTeam: ${isHomeTeam}, gets ${details}`);
      
      return supabase
        .from('game_stats')
        .insert({
          game_id: gameId,
          player_id: player.id,
          stat_type: 'plusMinus',
          period: period,
          value: statValue, // Always store positive value
          details: details, // 'plus' or 'minus'
          timestamp: new Date().toISOString()
        });
    });
    
    await Promise.all(insertPromises);
    
    // Refresh player stats for all involved players
    const refreshPromises = playerIds.map(playerId => 
      supabase.rpc('refresh_player_stats', { player_id: playerId })
    );
    
    await Promise.all(refreshPromises);
    console.log("Plus/Minus stats recorded and player stats refreshed");
    
    return true;
  } catch (error) {
    console.error('Error recording plus/minus stats:', error);
    return false;
  }
};
