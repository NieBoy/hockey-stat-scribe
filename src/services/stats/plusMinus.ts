
import { supabase } from '@/lib/supabase';

export const calculatePlusMinus = async (gameId: string, playerId: string, teamType: string): Promise<boolean> => {
  try {
    console.log(`calculatePlusMinus - Detailed debugging - gameId=${gameId}, playerId=${playerId}, teamType=${teamType}`);
    
    // Get player's team info
    const { data: playerTeam, error: playerError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError || !playerTeam) {
      console.error(`Could not find team for player ${playerId}:`, playerError);
      return false;
    }
    
    // Get game info to determine if it's a plus or minus
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    if (gameError || !game) {
      console.error(`Could not find game ${gameId}:`, gameError);
      return false;
    }
    
    const isHomeTeam = playerTeam.team_id === game.home_team_id;
    const isHomeTeamGoal = teamType === 'home';
    
    console.log(`calculatePlusMinus - Detailed info:`);
    console.log(`- Player team ID: ${playerTeam.team_id}`);
    console.log(`- Home team ID: ${game.home_team_id}`);
    console.log(`- Away team ID: ${game.away_team_id}`);
    console.log(`- Is player on home team? ${isHomeTeam}`);
    console.log(`- Is the goal by home team? ${isHomeTeamGoal}`);
    
    // Returns true for plus (player's team scored), false for minus (opponent team scored)
    const isPlusEvent = isHomeTeam === isHomeTeamGoal;
    console.log(`calculatePlusMinus result: ${isPlusEvent ? 'plus (+1)' : 'minus (-1)'} event`);
    
    return isPlusEvent;
  } catch (error) {
    console.error("Error calculating plus/minus:", error);
    throw error;
  }
};
