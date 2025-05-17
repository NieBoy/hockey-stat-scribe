
import { supabase } from "@/lib/supabase";
import { GameEvent, GameStat } from "@/types";
import { createGameStat } from "../utils/statsDbUtils";
import { calculateAndRecordPlusMinus } from "../utils/plusMinusCalculator";
import { calculatePlusMinusValue, PLUS_EVENT_VALUE, MINUS_EVENT_VALUE } from "../../utils/plusMinusCalculator";

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
          value: 1
        }) || statsCreated;
      } 
      else if (role === 'assist') {
        console.log(`Recording assist for player ${playerId}`);
        statsCreated = await createGameStat({ 
          game_id: event.game_id, 
          player_id: playerId, 
          stat_type: "assists", 
          period: event.period, 
          value: 1
        }) || statsCreated;
      }
      else if (role === 'on-ice' || role === 'on_ice') {
        // Process plus/minus for on-ice players
        console.log(`Recording plus/minus for player ${playerId} on scoring team`);
        statsCreated = await calculateAndRecordPlusMinus(
          event.game_id, 
          playerId, 
          event.team_type as 'home' | 'away',
          event.period
        ) || statsCreated;
      }
    }
    
    // Also process players on the negative plus/minus side
    const { data: oppositePlayers } = await supabase
      .from('event_players')
      .select('player_id, role')
      .eq('event_id', event.id)
      .eq('role', 'opponent-on-ice');
    
    if (oppositePlayers && oppositePlayers.length > 0) {
      // These players get the opposite plus/minus
      const oppositeTeamType = event.team_type === 'home' ? 'away' : 'home';
      
      for (const { player_id: playerId } of oppositePlayers) {
        console.log(`Recording plus/minus for opponent player ${playerId}`);
        statsCreated = await calculateAndRecordPlusMinus(
          event.game_id,
          playerId,
          oppositeTeamType as 'home' | 'away',
          event.period
        ) || statsCreated;
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error('Error processing goal event for stats:', error);
    return false;
  }
};
