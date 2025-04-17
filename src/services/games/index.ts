
import { Game } from '@/types';
import { fetchGameWithTeams, fetchTeamMembers, createNewGame } from './queries';
import { transformTeamData } from './teamTransforms';
import { GameDbResponse } from './types';

export const getGames = async (): Promise<Game[]> => {
  try {
    // Get games with team data
    const gamesData = await fetchGameWithTeams();
    
    // Ensure we're handling an array
    const gamesArray = Array.isArray(gamesData) ? gamesData : [gamesData];
    
    // Transform the database response to match our Game type
    const transformedData = await Promise.all(gamesArray.map(async game => {
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
    // Get game data with proper type handling
    const data = await fetchGameWithTeams(id);
    
    if (!data) {
      return null;
    }
    
    // The data is definitely a single GameDbResponse, not an array
    // thanks to the .single() in fetchGameWithTeams
    const gameData = data as GameDbResponse;
    
    // Get team members for both teams
    const [homeTeamMembers, awayTeamMembers] = await Promise.all([
      fetchTeamMembers(gameData.home_team.id),
      fetchTeamMembers(gameData.away_team.id)
    ]);
    
    // Transform the team data
    const homeTeam = transformTeamData(
      gameData.home_team.id,
      gameData.home_team.name,
      homeTeamMembers
    );
    
    const awayTeam = transformTeamData(
      gameData.away_team.id,
      gameData.away_team.name,
      awayTeamMembers
    );
    
    return {
      id: gameData.id,
      date: new Date(gameData.date),
      homeTeam,
      awayTeam,
      location: gameData.location,
      statTrackers: [],
      periods: gameData.periods,
      currentPeriod: gameData.current_period,
      isActive: gameData.is_active,
      stats: []
    };
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
    // Create the game
    const data = await createNewGame(
      gameData.date,
      gameData.location,
      gameData.homeTeam,
      gameData.awayTeam,
      gameData.periods
    );
    
    if (!data) {
      return null;
    }
    
    // The response is a single game, not an array
    const gameResponse = data as GameDbResponse;
    
    // Get team members for both teams
    const [homeTeamMembers, awayTeamMembers] = await Promise.all([
      fetchTeamMembers(gameResponse.home_team.id),
      fetchTeamMembers(gameResponse.away_team.id)
    ]);
    
    // Transform the team data
    const homeTeam = transformTeamData(
      gameResponse.home_team.id,
      gameResponse.home_team.name,
      homeTeamMembers
    );
    
    const awayTeam = transformTeamData(
      gameResponse.away_team.id,
      gameResponse.away_team.name,
      awayTeamMembers
    );
    
    return {
      id: gameResponse.id,
      date: new Date(gameResponse.date),
      homeTeam,
      awayTeam,
      location: gameResponse.location,
      statTrackers: [],
      periods: gameResponse.periods,
      currentPeriod: gameResponse.current_period,
      isActive: gameResponse.is_active,
      stats: []
    };
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
