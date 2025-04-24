
import { validatePlayerId, validateMultiplePlayers } from "@/services/events/shared/validatePlayer";
import { processGoalEvent } from './processors/goalProcessor';
import { processPenaltyEvent } from './processors/penaltyProcessor';
import { processFaceoffEvent } from './processors/faceoffProcessor';
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from './statsRefresh';

/**
 * Creates game stats from events for a player
 * @param playerId The team_member.id of the player to process events for
 * @param events Array of game events to process
 * @returns Promise<boolean> Success status
 */
export const createGameStatsFromEvents = async (playerId: string, events: any[]): Promise<boolean> => {
  try {
    console.log(`Creating game stats from ${events.length} events for player (team_member.id): ${playerId}`);
    
    // First validate that the playerId exists in team_members
    const isValid = await validatePlayerId(playerId);
    if (!isValid) {
      console.error(`Invalid player ID: ${playerId}. Must exist in team_members table.`);
      return false;
    }
    
    let statsCreated = false;
    
    // Process each event
    for (const event of events) {
      console.log(`Processing event ID: ${event.id}, type: ${event.event_type}`);
      
      // Convert details to proper format if needed
      let details;
      try {
        details = typeof event.details === 'string' 
          ? JSON.parse(event.details) 
          : event.details;
          
        console.log(`Event details: ${JSON.stringify(details)}`);
      } catch (parseError) {
        console.error(`Error parsing event details:`, parseError);
        console.log(`Raw details value:`, event.details);
        continue; // Skip this event if details can't be parsed
      }
      
      if (!details) {
        console.log(`No details found for event ${event.id}, skipping`);
        continue;
      }
      
      try {
        let result = false;
        
        // Extract player IDs for validation
        const playerIds = [
          details.playerId,
          details.primaryAssistId,
          details.secondaryAssistId,
          ...(details.playersOnIce || [])
        ].filter(Boolean);
        
        // Validate all player IDs before processing
        if (playerIds.length > 0) {
          const isValid = await validateMultiplePlayers(playerIds);
          if (!isValid) {
            console.error(`Invalid player IDs found in event ${event.id}`);
            continue;
          }
        }
        
        // Process different event types
        switch (event.event_type) {
          case 'goal':
            result = await processGoalEvent(event, playerId, details);
            console.log(`Goal event processing result: ${result ? 'Stats created' : 'No stats created'}`);
            break;
          case 'penalty':
            result = await processPenaltyEvent(event, playerId, details);
            console.log(`Penalty event processing result: ${result ? 'Stats created' : 'No stats created'}`);
            break;
          case 'faceoff':
            result = await processFaceoffEvent(event, playerId, details);
            console.log(`Faceoff event processing result: ${result ? 'Stats created' : 'No stats created'}`);
            break;
        }
        
        statsCreated = result || statsCreated;
        
      } catch (eventProcessError) {
        console.error(`Error processing event ${event.id} of type ${event.event_type}:`, eventProcessError);
        // Continue with next event rather than breaking the entire process
      }
    }
    
    if (statsCreated) {
      console.log(`Successfully created stats from events for player ${playerId}`);
      
      // After creating individual stats, refresh aggregated stats
      const { error } = await supabase.rpc('refresh_player_stats', { player_id: playerId });
      if (error) {
        console.error(`Error calling refresh_player_stats for ${playerId}:`, error);
        return statsCreated; // Still return true if stats were created, even if refresh failed
      }
    } else {
      console.log(`No stats were created from events for player ${playerId}`);
    }
    
    return statsCreated;
  } catch (error) {
    console.error("Error creating game stats from events:", error);
    return false;
  }
};
