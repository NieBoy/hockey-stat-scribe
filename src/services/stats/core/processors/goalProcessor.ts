
import { supabase } from "@/lib/supabase";
import { GameEvent, GameStat } from "@/types";
import { createGameStat } from "../utils/statsDbUtils";

export const processGoalEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  let statsCreated = false;
  
  try {
    console.log(`Processing goal event for player ${playerId}`, details);
    
    // Check if player is scorer
    if (details && details.playerId === playerId) {
      console.log(`Player ${playerId} is the goal scorer`);
      const goalStat = await createGameStat(event.game_id, playerId, 'goals', event.period);
      statsCreated = goalStat || statsCreated;
    }
    
    // Check for assists
    if (details && details.primaryAssistId === playerId) {
      console.log(`Player ${playerId} has primary assist`);
      const assistStat = await createGameStat(event.game_id, playerId, 'assists', event.period, 'primary');
      statsCreated = assistStat || statsCreated;
    }
    
    if (details && details.secondaryAssistId === playerId) {
      console.log(`Player ${playerId} has secondary assist`);
      const assistStat = await createGameStat(event.game_id, playerId, 'assists', event.period, 'secondary');
      statsCreated = assistStat || statsCreated;
    }
    
    // Check if player was on ice for this goal
    if (details && details.playersOnIce && Array.isArray(details.playersOnIce)) {
      if (details.playersOnIce.includes(playerId)) {
        console.log(`Player ${playerId} was on ice for this goal`);
        const plusMinusStat = await createPlusMinus(event, playerId);
        statsCreated = plusMinusStat || statsCreated;
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error(`Error processing goal event for player ${playerId}:`, error);
    return false;
  }
};

const createPlusMinus = async (event: any, playerId: string): Promise<boolean> => {
  try {
    // Get player's team info and game info
    const playerTeam = await getPlayerTeamFromDb(playerId);
    const game = await getGameTeamsFromDb(event.game_id);
    
    if (!playerTeam || !game) {
      console.error(`Could not find team/game info for player ${playerId}`);
      return false;
    }
    
    const isHomeTeam = playerTeam.team_id === game.home_team_id;
    const isHomeTeamGoal = event.team_type === 'home';
    const isPlus = isHomeTeam === isHomeTeamGoal;
    
    console.log(`Player ${playerId} ${isPlus ? '+1' : '-1'} for this goal`);
    
    return await createGameStat(
      event.game_id,
      playerId,
      'plusMinus',
      event.period,
      isPlus ? 'plus' : 'minus'
    );
  } catch (error) {
    console.error(`Error creating plus/minus stat:`, error);
    return false;
  }
};

// Helper function to get player team from database
const getPlayerTeamFromDb = async (playerId: string) => {
  try {
    const { data: playerTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
      .single();
      
    return playerTeam;
  } catch (error) {
    console.error(`Error fetching player team:`, error);
    return null;
  }
};

// Helper function to get game teams from database
const getGameTeamsFromDb = async (gameId: string) => {
  try {
    const { data: game } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', gameId)
      .single();
      
    return game;
  } catch (error) {
    console.error(`Error fetching game:`, error);
    return null;
  }
};
