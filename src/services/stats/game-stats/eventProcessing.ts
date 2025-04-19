
import { supabase } from '@/lib/supabase';
import { insertGameStat } from './creation';
import { calculatePlusMinus } from './plusMinus';

export const createStatsFromEvents = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Creating game stats from events for player: ${playerId}`);
    
    // Get all game events that reference this player
    // The problem was that we were using a different query approach than what works in usePlayerStatsData.ts
    // Let's use the same approach that successfully finds events
    
    // First get events where player is directly referenced in specific fields
    const { data: directEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type, timestamp')
      .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`);
      
    if (eventsError) {
      console.error("Error fetching game events (direct references):", eventsError);
      return false;
    }
    
    // Then get events where player is in the playersOnIce array
    const { data: onIceEvents, error: onIceError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type, timestamp')
      .contains('details', { playersOnIce: [playerId] });
    
    if (onIceError) {
      console.error("Error fetching game events (on ice):", onIceError);
      return false;
    }
    
    // Combine both result sets and remove duplicates
    const allEvents = [...(directEvents || []), ...(onIceEvents || [])];
    const events = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );
    
    console.log(`Found ${events?.length || 0} game events for player to process`);
    
    if (!events || events.length === 0) {
      return false;
    }
    
    let statsCreated = false;
    
    for (const event of events) {
      if (event.event_type === 'goal' && event.details) {
        console.log(`Processing goal event: ${event.id}`);
        
        // Create goal stat if player is the scorer
        if (event.details.playerId === playerId) {
          try {
            console.log(`Player ${playerId} is the scorer, adding goal stat`);
            
            // First check if this stat already exists to avoid duplicates
            const { data: existingStat } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerId)
              .eq('stat_type', 'goals')
              .eq('period', event.period)
              .maybeSingle();
              
            if (!existingStat) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId,
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
        if (event.details.primaryAssistId === playerId) {
          try {
            console.log(`Player ${playerId} has primary assist, adding assist stat`);
            
            const { data: existingAssist } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerId)
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
        
        if (event.details.secondaryAssistId === playerId) {
          try {
            console.log(`Player ${playerId} has secondary assist, adding assist stat`);
            
            const { data: existingAssist } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerId)
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
        
        // Create plus/minus stat if player was on ice
        if (event.details.playersOnIce && 
            Array.isArray(event.details.playersOnIce) && 
            event.details.playersOnIce.includes(playerId)) {
          try {
            console.log(`Player ${playerId} was on ice, calculating plus/minus`);
            
            const { data: existingPlusMinus } = await supabase
              .from('game_stats')
              .select('id')
              .eq('game_id', event.game_id)
              .eq('player_id', playerId)
              .eq('stat_type', 'plusMinus')
              .eq('period', event.period)
              .maybeSingle();
              
            if (!existingPlusMinus) {
              const isPlus = await calculatePlusMinus(event.game_id, playerId, event.team_type);
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId,
                statType: 'plusMinus',
                period: event.period,
                value: 1,
                details: isPlus ? 'plus' : 'minus'
              });
              statsCreated = true;
              console.log(`Added plus/minus stat for player ${playerId} (${isPlus ? 'plus' : 'minus'})`);
            } else {
              console.log(`Plus/minus stat already exists for this event`);
            }
          } catch (error) {
            console.error("Error creating plus/minus stat:", error);
          }
        }
      }
    }
    
    console.log(`Stats creation process completed. Created stats: ${statsCreated}`);
    return statsCreated;
  } catch (error) {
    console.error("Error creating stats from events:", error);
    return false;
  }
};
