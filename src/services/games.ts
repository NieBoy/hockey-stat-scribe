
// This is a stub implementation that will be replaced with actual API calls
import { Game, User, Team, GameStat } from '@/types';
import { mockGames, mockUsers, mockTeams } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

export const getGames = async (): Promise<Game[]> => {
  // In a real app, this would fetch from an API
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockGames;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const getGameById = async (id: string): Promise<Game | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGames.find(game => game.id === id) || null;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
};

export const createGame = async (gameData: {
  date: Date;
  location: string;
  homeTeam: string; // Changed from homeTeamId
  awayTeam: string; // Changed from awayTeamId
  periods: number;
}): Promise<Game | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get home and away teams
    const homeTeam = mockTeams.find(team => team.id === gameData.homeTeam);
    const awayTeam = mockTeams.find(team => team.id === gameData.awayTeam);
    
    if (!homeTeam || !awayTeam) {
      throw new Error("One or more teams not found");
    }
    
    const newGame: Game = {
      id: `game-${Date.now()}`,
      date: gameData.date,
      location: gameData.location,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      statTrackers: [],
      periods: gameData.periods,
      currentPeriod: 0,
      isActive: false,
      stats: []
    };
    
    // In a real app, we would save to database here
    return newGame;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

export const startGame = async (id: string): Promise<Game | null> => {
  try {
    const game = mockGames.find(g => g.id === id);
    if (!game) return null;
    
    // Update game state
    game.isActive = true;
    game.currentPeriod = 1;
    
    return game;
  } catch (error) {
    console.error("Error starting game:", error);
    return null;
  }
};

export const endGame = async (id: string): Promise<Game | null> => {
  try {
    const game = mockGames.find(g => g.id === id);
    if (!game) return null;
    
    // Update game state
    game.isActive = false;
    
    return game;
  } catch (error) {
    console.error("Error ending game:", error);
    return null;
  }
};

export const getGamesByTeam = async (teamId: string): Promise<Game[]> => {
  try {
    return mockGames.filter(game => 
      game.homeTeam.id === teamId || game.awayTeam.id === teamId
    );
  } catch (error) {
    console.error("Error fetching team games:", error);
    return [];
  }
};

// Mock function to simulate creating teams for testing
export const createMockTeam = async (name: string): Promise<Team> => {
  const newTeam: Team = {
    id: `team-${Date.now()}`,
    name,
    players: [],
    coaches: [],
    parents: []
  };
  
  return newTeam;
};

// Mock function to simulate adding a player to a team for testing
export const addPlayerToTeam = async (teamId: string, user: User): Promise<Team | null> => {
  const team = mockTeams.find(t => t.id === teamId);
  if (!team) return null;
  
  team.players.push(user);
  return team;
};
