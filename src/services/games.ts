
import { Game, User, Team, GameStat } from '@/types';
import { supabase } from '@/lib/supabase';

export const getGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:home_team_id (
          id,
          name,
          players:team_members(*)
        ),
        away_team:away_team_id (
          id,
          name,
          players:team_members(*)
        )
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const getGameById = async (id: string): Promise<Game | null> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:home_team_id (
          id,
          name,
          players:team_members(*)
        ),
        away_team:away_team_id (
          id,
          name,
          players:team_members(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
};

export const createGame = async (gameData: {
  date: Date;
  location: string;
  homeTeam: string;
  awayTeam: string;
  periods: number;
}): Promise<Game | null> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: gameData.date.toISOString(),
        location: gameData.location,
        home_team_id: gameData.homeTeam,
        away_team_id: gameData.awayTeam,
        periods: gameData.periods,
        current_period: 0,
        is_active: false
      })
      .select(`
        *,
        home_team:home_team_id (
          id,
          name,
          players:team_members(*)
        ),
        away_team:away_team_id (
          id,
          name,
          players:team_members(*)
        )
      `)
      .single();

    if (error) {
      console.error("Error creating game:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

export const startGame = async (id: string): Promise<Game | null> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Starting game:", id);
    return null;
  } catch (error) {
    console.error("Error starting game:", error);
    return null;
  }
};

export const endGame = async (id: string): Promise<Game | null> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Ending game:", id);
    return null;
  } catch (error) {
    console.error("Error ending game:", error);
    return null;
  }
};

export const getGamesByTeam = async (teamId: string): Promise<Game[]> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Getting games for team:", teamId);
    return [];
  } catch (error) {
    console.error("Error fetching team games:", error);
    return [];
  }
};
