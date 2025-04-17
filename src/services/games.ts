
import { Game, User, Team, GameStat } from '@/types';
import { supabase } from '@/lib/supabase';

export const getGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(
          id,
          name,
          team_members(*)
        ),
        away_team:teams!away_team_id(
          id,
          name,
          team_members(*)
        )
      `);

    if (error) throw error;
    
    // Transform the database response to match our Game type
    const transformedData = data?.map(game => {
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: game.home_team.id,
        name: game.home_team.name,
        players: game.home_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: game.home_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: game.home_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: game.away_team.id,
        name: game.away_team.name,
        players: game.away_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: game.away_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: game.away_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      return {
        id: game.id,
        date: new Date(game.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: game.location,
        statTrackers: [], // Default empty array
        periods: game.periods,
        currentPeriod: game.current_period,
        isActive: game.is_active,
        stats: [] // Default empty array
      };
    }) || [];
    
    return transformedData;
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
        home_team:teams!home_team_id(
          id,
          name,
          team_members(*)
        ),
        away_team:teams!away_team_id(
          id,
          name,
          team_members(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform to match Game type
    if (data) {
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: data.home_team.id,
        name: data.home_team.name,
        players: data.home_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: data.home_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: data.home_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: data.away_team.id,
        name: data.away_team.name,
        players: data.away_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: data.away_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: data.away_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      const game: Game = {
        id: data.id,
        date: new Date(data.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: data.location,
        statTrackers: [], // Default empty array
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: [] // Default empty array
      };
      return game;
    }
    
    return null;
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
        home_team:teams!home_team_id(
          id,
          name,
          team_members(*)
        ),
        away_team:teams!away_team_id(
          id,
          name,
          team_members(*)
        )
      `)
      .single();

    if (error) {
      console.error("Error creating game:", error);
      throw error;
    }

    // Transform to match Game type
    if (data) {
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: data.home_team.id,
        name: data.home_team.name,
        players: data.home_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: data.home_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: data.home_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: data.away_team.id,
        name: data.away_team.name,
        players: data.away_team.team_members?.filter(m => m.role === 'player') || [],
        coaches: data.away_team.team_members?.filter(m => m.role === 'coach') || [],
        parents: data.away_team.team_members?.filter(m => m.role === 'parent') || []
      };
      
      const game: Game = {
        id: data.id,
        date: new Date(data.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: data.location,
        statTrackers: [], // Default empty array
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: [] // Default empty array
      };
      return game;
    }
    
    return null;
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
