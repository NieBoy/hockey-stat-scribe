
import { supabase } from '@/lib/supabase';
import { queries } from './queries';
import { transformTeamForCreate } from './teamTransforms';

export interface GameCreateParams {
  date: Date;
  location: string;
  homeTeam: string;
  opponentName?: string;
  periods?: number;
}

// Create a new game
export const createGame = async (params: GameCreateParams) => {
  try {
    const { date, location, homeTeam, opponentName, periods = 3 } = params;

    // Create the game with the home team and opponent name
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: date.toISOString(),
        location,
        home_team_id: homeTeam,
        opponent_name: opponentName || null,
        periods,
        current_period: 0,
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return { success: false, error };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error in createGame service:', error);
    return {
      success: false,
      error: {
        message: 'Failed to create game',
        details: error,
      },
    };
  }
};

// Get all games
export const getGames = async () => {
  try {
    // Get games with team data
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        date,
        location,
        periods,
        current_period,
        is_active,
        opponent_name,
        home_team:teams!home_team_id (id, name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }

    return data.map(game => ({
      id: game.id,
      date: game.date,
      location: game.location,
      periods: game.periods,
      current_period: game.current_period,
      is_active: game.is_active,
      homeTeam: {
        id: game.home_team?.id || '',
        name: game.home_team?.name || 'Unknown Team',
        players: []
      },
      awayTeam: game.opponent_name ? { id: 'opponent', name: game.opponent_name, players: [] } : null
    }));
  } catch (error) {
    console.error('Error in getGames service:', error);
    return [];
  }
};

export { queries };
