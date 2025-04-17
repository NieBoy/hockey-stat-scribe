
import { Game } from '@/types';
import { fetchGameWithTeams, fetchTeamMembers, createNewGame } from './queries';
import { transformTeamData } from './teamTransforms';

export const getGames = async (): Promise<Game[]> => {
  try {
    const { data: gamesData, error } = await fetchGameWithTeams();
    if (error) throw error;
    
    // Transform the database response to match our Game type
    const transformedData = await Promise.all((gamesData || []).map(async game => {
      // Get team members for both teams
      const [homeTeamMembers, awayTeamMembers] = await Promise.all([
        fetchTeamMembers(game.home_team.id),
        fetchTeamMembers(game.away_team.id)
      ]);
      
      // Transform the team data
      const homeTeam = transformTeamData(
        game.home_team.id,
        game.home_team.name,
        homeTeamMembers
      );
      
      const awayTeam = transformTeamData(
        game.away_team.id,
        game.away_team.name,
        awayTeamMembers
      );
      
      return {
        id: game.id,
        date: new Date(game.date),
        homeTeam,
        awayTeam,
        location: game.location,
        statTrackers: [],
        periods: game.periods,
        currentPeriod: game.current_period,
        isActive: game.is_active,
        stats: []
      };
    }));
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const getGameById = async (id: string): Promise<Game | null> => {
  try {
    const { data, error } = await fetchGameWithTeams(id);
    if (error) throw error;
    
    if (data) {
      // Get team members for both teams
      const [homeTeamMembers, awayTeamMembers] = await Promise.all([
        fetchTeamMembers(data.home_team.id),
        fetchTeamMembers(data.away_team.id)
      ]);
      
      // Transform the team data
      const homeTeam = transformTeamData(
        data.home_team.id,
        data.home_team.name,
        homeTeamMembers
      );
      
      const awayTeam = transformTeamData(
        data.away_team.id,
        data.away_team.name,
        awayTeamMembers
      );
      
      return {
        id: data.id,
        date: new Date(data.date),
        homeTeam,
        awayTeam,
        location: data.location,
        statTrackers: [],
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: []
      };
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
    const data = await createNewGame(
      gameData.date,
      gameData.location,
      gameData.homeTeam,
      gameData.awayTeam,
      gameData.periods
    );
    
    if (data) {
      // Get team members for both teams
      const [homeTeamMembers, awayTeamMembers] = await Promise.all([
        fetchTeamMembers(data.home_team.id),
        fetchTeamMembers(data.away_team.id)
      ]);
      
      // Transform the team data
      const homeTeam = transformTeamData(
        data.home_team.id,
        data.home_team.name,
        homeTeamMembers
      );
      
      const awayTeam = transformTeamData(
        data.away_team.id,
        data.away_team.name,
        awayTeamMembers
      );
      
      return {
        id: data.id,
        date: new Date(data.date),
        homeTeam,
        awayTeam,
        location: data.location,
        statTrackers: [],
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: []
      };
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
