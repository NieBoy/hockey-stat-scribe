
import { supabase } from '@/lib/supabase';
import { insertGameStat } from './creation';
import { calculatePlusMinus } from './plusMinus';

export const createStatsFromEvents = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Creating game stats from events for player: ${playerId}`);
    
    // First verify player exists in team_members table AND has a valid user_id
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name, user_id')
      .eq('id', playerId)
      .maybeSingle();
      
    if (playerError) {
      console.error("Error verifying player existence:", playerError);
      throw new Error(`Player verification failed: ${playerError.message}`);
    }
    
    if (!playerData) {
      console.error(`Player ${playerId} does not exist in team_members table`);
      throw new Error(`Player ID ${playerId} not found in team_members table`);
    }
    
    if (!playerData.user_id) {
      console.error(`Player ${playerId} (${playerData.name}) exists but has no user_id in team_members table`);
      throw new Error(`Player ID ${playerId} does not have a valid user_id association`);
    }
    
    console.log(`Found player name: ${playerData.name}, user_id: ${playerData.user_id}`);
    
    // Get all game events that reference this player
    // Using the approach that successfully finds events in usePlayerStatsData.ts
    
    // First get events where player is directly referenced in specific fields
    const { data: directEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type, timestamp')
      .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`);
      
    if (eventsError) {
      console.error("Error fetching game events (direct references):", eventsError);
      return false;
    }
    
    console.log(`Found ${directEvents?.length || 0} events with direct references to player ${playerId}`);
    
    // Then get events where player is in the playersOnIce array
    const { data: onIceEvents, error: onIceError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type, timestamp')
      .contains('details', { playersOnIce: [playerId] });
    
    if (onIceError) {
      console.error("Error fetching game events (on ice):", onIceError);
      return false;
    }
    
    console.log(`Found ${onIceEvents?.length || 0} events with player ${playerId} on ice`);
    
    // Combine both result sets and remove duplicates
    const allEvents = [...(directEvents || []), ...(onIceEvents || [])];
    const events = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );
    
    console.log(`Found ${events?.length || 0} total unique game events for player to process`);
    
    if (!events || events.length === 0) {
      console.log(`No events found for player ${playerId} to process`);
      return false;
    }
    
    let statsCreated = false;
    
    // Process each event and create appropriate stats
    for (const event of events) {
      if (event.event_type === 'goal' && event.details) {
        console.log(`Processing goal event: ${event.id}`);
        
        // Make sure details is properly parsed if it's a string
        const details = typeof event.details === 'string' ? JSON.parse(event.details) : event.details;
        
        // Create goal stat if player is the scorer
        if (details.playerId === playerId) {
          try {
            console.log(`Player ${playerId} is the scorer, adding goal stat`);
            
            // First check if this stat already exists to avoid duplicates
            const { data: existingStat } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerData.user_id) // Use user_id for checking existing stats
              .eq('stat_type', 'goals')
              .eq('period', event.period)
              .maybeSingle();
              
            if (!existingStat) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId, // Keep using team_member ID for consistency 
                statType: 'goals',
                period: event.period,
                value: 1,
                details: ''
              });
              statsCreated = true;
              console.log(`Added goal stat for player ${playerId}`);
            } else {
              console.log(`Goal stat already exists for this event`);
            }
          } catch (error) {
            console.error("Error creating goal stat:", error);
          }
        }
        
        // Create assist stats
        if (details.primaryAssistId === playerId) {
          try {
            console.log(`Player ${playerId} has primary assist, adding assist stat`);
            
            const { data: existingAssist } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerData.user_id) // Use user_id for checking existing stats
              .eq('stat_type', 'assists')
              .eq('period', event.period)
              .eq('details', 'primary')
              .maybeSingle();
              
            if (!existingAssist) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId,
                statType: 'assists',
                period: event.period,
                value: 1,
                details: 'primary'
              });
              statsCreated = true;
              console.log(`Added primary assist stat for player ${playerId}`);
            } else {
              console.log(`Primary assist stat already exists for this event`);
            }
          } catch (error) {
            console.error("Error creating primary assist stat:", error);
          }
        }
        
        if (details.secondaryAssistId === playerId) {
          try {
            console.log(`Player ${playerId} has secondary assist, adding assist stat`);
            
            const { data: existingAssist } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerData.user_id) // Use user_id for checking existing stats
              .eq('stat_type', 'assists')
              .eq('period', event.period)
              .eq('details', 'secondary')
              .maybeSingle();
              
            if (!existingAssist) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId,
                statType: 'assists',
                period: event.period,
                value: 1,
                details: 'secondary'
              });
              statsCreated = true;
              console.log(`Added secondary assist stat for player ${playerId}`);
            } else {
              console.log(`Secondary assist stat already exists for this event`);
            }
          } catch (error) {
            console.error("Error creating secondary assist stat:", error);
          }
        }
        
        // Plus/minus calculation is temporarily disabled
    
      }
    }
    
    // After processing all events, refresh player stats
    if (statsCreated) {
      try {
        // Update aggregate player stats
        const { error } = await supabase.rpc('refresh_player_stats', { player_id: playerData.user_id });
        if (error) {
          console.error("Error calling refresh_player_stats function:", error);
        } else {
          console.log("Successfully refreshed aggregated player stats");
        }
      } catch (error) {
        console.error("Error updating aggregated player stats:", error);
      }
    }
    
    console.log(`Stats creation process completed. Created stats: ${statsCreated}`);
    return statsCreated;
  } catch (error) {
    console.error("Error creating stats from events:", error);
    return false;
  }
};
