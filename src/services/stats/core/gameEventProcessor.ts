
import { supabase } from "@/lib/supabase";
import { validatePlayerId } from "@/services/events/shared/validatePlayer";

/**
 * Process game events to stats for a specific player
 * @param playerId The team_member.id to process stats for
 * @param events Array of game events
 */
export const processEventsToStats = async (playerId: string, events: any[]): Promise<boolean> => {
  console.log(`Processing ${events.length} events for player ${playerId}`);
  
  try {
    // Validate player exists in team_members table
    const isPlayerValid = await validatePlayerId(playerId);
    if (!isPlayerValid) {
      console.error(`Cannot process events: Invalid player ID ${playerId} not found in team_members table`);
      return false;
    }
    
    let processedCount = 0;
    
    // Process goal events
    for (const event of events) {
      if (event.event_type === 'goal') {
        const details = event.details || {};
        
        // Process scorer
        if (details.playerId === playerId) {
          await recordStat(event.game_id, playerId, 'goals', event.period, 1);
          processedCount++;
        }
        
        // Process primary assist
        if (details.primaryAssistId === playerId) {
          await recordStat(event.game_id, playerId, 'assists', event.period, 1);
          processedCount++;
        }
        
        // Process secondary assist
        if (details.secondaryAssistId === playerId) {
          await recordStat(event.game_id, playerId, 'assists', event.period, 1);
          processedCount++;
        }
        
        // Process plus/minus for players on ice
        if (Array.isArray(details.playersOnIce) && details.playersOnIce.includes(playerId)) {
          await recordStat(event.game_id, playerId, 'plusMinus', event.period, 1);
          processedCount++;
        }
      }
      else if (event.event_type === 'shot') {
        const details = event.details || {};
        
        // Process shooter
        if (details.playerId === playerId) {
          await recordStat(event.game_id, playerId, 'shots', event.period, 1);
          processedCount++;
        }
        
        // Process goalie save
        if (details.goalieId === playerId) {
          await recordStat(event.game_id, playerId, 'saves', event.period, 1);
          processedCount++;
        }
      }
      else if (event.event_type === 'hit') {
        const details = event.details || {};
        
        // Process player delivering the hit
        if (details.hittingPlayerId === playerId) {
          await recordStat(event.game_id, playerId, 'hits', event.period, 1);
          processedCount++;
        }
      }
      else if (event.event_type === 'faceoff') {
        const details = event.details || {};
        
        // Process faceoff win
        if (details.winnerId === playerId) {
          await recordStat(event.game_id, playerId, 'faceoffs', event.period, 1);
          processedCount++;
        }
      }
      else if (event.event_type === 'penalty') {
        const details = event.details || {};
        
        // Process player who took the penalty
        if (details.playerId === playerId) {
          await recordStat(event.game_id, playerId, 'penalties', event.period, 1);
          processedCount++;
        }
      }
    }
    
    console.log(`Successfully processed ${processedCount} stats for player ${playerId}`);
    return true;
  } catch (error) {
    console.error(`Error processing events for player ${playerId}:`, error);
    return false;
  }
};

/**
 * Creates game stats from game events
 * @param playerId The team_member.id to process stats for
 * @param events Array of game events
 */
export const createGameStatsFromEvents = async (playerId: string, events: any[]): Promise<boolean> => {
  return processEventsToStats(playerId, events);
};

/**
 * Record a single stat using the record_game_stat database function
 * @param gameId Game ID
 * @param playerId team_member.id of the player
 * @param statType Type of stat
 * @param period Game period
 * @param value Stat value
 */
async function recordStat(
  gameId: string, 
  playerId: string, 
  statType: string, 
  period: number, 
  value: number
): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: gameId,
      p_player_id: playerId,
      p_stat_type: statType,
      p_period: period,
      p_value: value
    });
    
    if (error) {
      console.error(`Error creating ${statType} stat using RPC:`, error);
    } else {
      console.log(`Successfully recorded ${statType} stat for player ${playerId}`);
    }
  } catch (error) {
    console.error(`Error recording ${statType} stat:`, error);
  }
}
