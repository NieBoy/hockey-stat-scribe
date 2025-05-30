import { supabase } from '@/lib/supabase';
import { Game } from '@/types';
import { ensureGameCompatibility as utilsEnsureGameCompatibility } from '@/utils/typeConversions';
import { queries } from './queries';

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

    // If there's an opponent name, first ensure it exists in the opponents table
    let opponentId = null;
    if (opponentName) {
      // Check if opponent exists
      const { data: existingOpponent } = await supabase
        .from('opponents')
        .select('id')
        .eq('name', opponentName)
        .single();

      if (existingOpponent) {
        opponentId = existingOpponent.id;
      } else {
        // Create new opponent
        const { data: newOpponent, error: opponentError } = await supabase
          .from('opponents')
          .insert({ name: opponentName })
          .select()
          .single();

        if (opponentError) {
          console.error('Error creating opponent:', opponentError);
          return { success: false, error: opponentError };
        }

        opponentId = newOpponent.id;
      }
    }

    // Create the game with the opponent id
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: date.toISOString(),
        location,
        home_team_id: homeTeam,
        opponent_id: opponentId,
        opponent_name: opponentName, // Keep this for backward compatibility during migration
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

// Helper function to safely extract team data regardless of format
const extractTeamData = (teamData: any) => {
  // If it's an array with at least one element, use the first element
  if (Array.isArray(teamData) && teamData.length > 0) {
    return {
      id: teamData[0]?.id || '',
      name: teamData[0]?.name || 'Unknown Team'
    };
  }
  // If it's an object, use it directly
  else if (typeof teamData === 'object' && teamData !== null) {
    return {
      id: teamData.id || '',
      name: teamData.name || 'Unknown Team'
    };
  }
  // Default fallback
  return {
    id: '',
    name: 'Unknown Team'
  };
};

// Re-export the utility function to prevent naming conflicts
export const ensureGameCompatibility = utilsEnsureGameCompatibility;

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

    return data.map(game => {
      const homeTeamData = extractTeamData(game.home_team);
      
      return {
        id: game.id,
        date: game.date,
        location: game.location,
        periods: game.periods,
        current_period: game.current_period,
        is_active: game.is_active,
        isActive: game.is_active, // Add isActive alias for compatibility
        homeTeam: {
          id: homeTeamData.id,
          name: homeTeamData.name,
          players: []
        },
        awayTeam: game.opponent_name ? { id: 'opponent', name: game.opponent_name, players: [] } : null
      };
    });
  } catch (error) {
    console.error('Error in getGames service:', error);
    return [];
  }
};

// Get game by ID
export const getGameById = async (gameId: string) => {
  try {
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
        home_team_id,
        away_team_id,
        opponent_id,
        home_team:teams!home_team_id (id, name)
      `)
      .eq('id', gameId)
      .single();

    if (error) {
      console.error('Error fetching game:', error);
      return null;
    }

    const homeTeamData = extractTeamData(data.home_team);

    // Map the database response to the Game type format
    return {
      id: data.id,
      date: data.date,
      location: data.location,
      periods: data.periods,
      current_period: data.current_period,
      is_active: data.is_active,
      isActive: data.is_active, // Add isActive alias for compatibility
      home_team_id: data.home_team_id,
      away_team_id: data.away_team_id,
      opponent_id: data.opponent_id,
      opponent_name: data.opponent_name,
      homeTeam: {
        id: homeTeamData.id,
        name: homeTeamData.name,
        players: []
      },
      awayTeam: data.opponent_name ? { 
        id: data.away_team_id || 'opponent', 
        name: data.opponent_name, 
        players: [] 
      } : null,
      statTrackers: []
    };
  } catch (error) {
    console.error('Error in getGameById service:', error);
    return null;
  }
};

export { queries };
