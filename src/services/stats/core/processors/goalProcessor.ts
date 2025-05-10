
import { supabase } from "@/lib/supabase";
import { GameEvent, GameStat } from "@/types";
import { createGameStat } from "../utils/statsDbUtils";

/**
 * Process a goal event to create relevant game stats
 */
export const processGoalEvent = async (event: GameEvent): Promise<boolean> => {
  if (event.event_type !== 'goal') return false;
  
  try {
    console.log(`Processing goal event ${event.id} for stats creation`);
    let statsCreated = false;
    
    // Get players involved in this goal event
    const { data: eventPlayers } = await supabase
      .from('event_players')
      .select('player_id, role')
      .eq('event_id', event.id);
    
    if (!eventPlayers || eventPlayers.length === 0) {
      console.log('No players found for this goal event, skipping stats creation');
      return false;
    }
    
    // Process each player based on role
    for (const { player_id: playerId, role } of eventPlayers) {
      // Create stats based on player roles
      if (role === 'scorer') {
        console.log(`Recording goal for player ${playerId}`);
        statsCreated = await createGameStat({ 
          game_id: event.game_id, 
          player_id: playerId, 
          stat_type: "goals", 
          period: event.period, 
          value: 1 // Using number instead of string
        }) || statsCreated;
      } 
      else if (role === 'assist') {
        console.log(`Recording assist for player ${playerId}`);
        statsCreated = await createGameStat({ 
          game_id: event.game_id, 
          player_id: playerId, 
          stat_type: "assists", 
          period: event.period, 
          value: 1 // Using number instead of string
        }) || statsCreated;
      }
      else if (role === 'on-ice' || role === 'on_ice') {
        // For players on ice, record plus/minus
        // Determine if it's a plus or minus based on team context
        const isPlus = event.team_type === 'home';
        
        // Create the plus/minus stat with actual +1/-1 value
        const plusMinusValue = isPlus ? 1 : -1;
        
        console.log(`Recording ${isPlus ? 'plus' : 'minus'} (${plusMinusValue}) for player ${playerId}`);
        
        // Record the correct plus/minus value directly
        statsCreated = await createRawPlusMinus(event.game_id, playerId, event.period, plusMinusValue) || statsCreated;
      }
    }
    
    // Also process players on the negative plus/minus side
    // In a real game, we'd have a more sophisticated way of determining who was on ice
    // For now, we assume any players tagged as 'opponent-on-ice' were on the other team
    const { data: oppositePlayers } = await supabase
      .from('event_players')
      .select('player_id, role')
      .eq('event_id', event.id)
      .eq('role', 'opponent-on-ice');
    
    if (oppositePlayers && oppositePlayers.length > 0) {
      // These players get the opposite plus/minus
      const isPlus = event.team_type !== 'home';
      const plusMinusValue = isPlus ? 1 : -1;
      
      for (const { player_id: playerId } of oppositePlayers) {
        console.log(`Recording opposite +/- (${plusMinusValue}) for opponent player ${playerId}`);
        statsCreated = await createRawPlusMinus(event.game_id, playerId, event.period, plusMinusValue) || statsCreated;
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error('Error processing goal event for stats:', error);
    return false;
  }
};

/**
 * Create a raw plus/minus stat record directly
 */
const createRawPlusMinus = async (
  gameId: string, 
  playerId: string, 
  period: number,
  value: number // This will be +1 or -1
): Promise<boolean> => {
  try {
    console.log(`Recording plusMinus: ${value} for player ${playerId}`);
    
    return createGameStat({
      game_id: gameId,
      player_id: playerId,
      stat_type: 'plusMinus',
      period: period,
      value: value // Using number directly
    });
  } catch (error) {
    console.error('Error in createRawPlusMinus:', error);
    return false;
  }
};
