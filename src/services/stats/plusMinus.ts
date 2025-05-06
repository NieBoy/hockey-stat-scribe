
import { supabase } from '@/lib/supabase';

export const calculatePlusMinus = async (gameId: string, playerId: string, teamType: string): Promise<boolean> => {
  try {
    // Get player's team info
    const { data: playerTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
      .single();
      
    if (!playerTeam) {
      console.error(`Could not find team for player ${playerId}`);
      return false;
    }
    
    // Get game info to determine if it's a plus or minus
    const { data: game } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    if (!game) {
      console.error(`Could not find game ${gameId}`);
      return false;
    }
    
    const isHomeTeam = playerTeam.team_id === game.home_team_id;
    const isHomeTeamGoal = teamType === 'home';
    
    console.log(`calculatePlusMinus - Player team: ${isHomeTeam ? 'home' : 'away'}, Goal by: ${teamType}`);
    
    // Returns true for plus (player's team scored), false for minus (opponent team scored)
    const isPlusEvent = isHomeTeam === isHomeTeamGoal;
    console.log(`calculatePlusMinus result: ${isPlusEvent ? 'plus' : 'minus'} event`);
    
    return isPlusEvent;
  } catch (error) {
    console.error("Error calculating plus/minus:", error);
    throw error;
  }
};
