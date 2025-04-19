
import { supabase } from '@/lib/supabase';
import { insertGameStat } from './creation';
import { calculatePlusMinus } from './plusMinus';

export const createStatsFromEvents = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Creating game stats from events for player: ${playerId}`);
    
    // Get all game events that reference this player
    const { data: events, error: eventsError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type')
      .or(`details->playerId.eq.${playerId},details->primaryAssistId.eq.${playerId},details->secondaryAssistId.eq.${playerId},details->playersOnIce.cs.{${playerId}}`);
      
    if (eventsError) {
      console.error("Error fetching game events:", eventsError);
      return false;
    }
    
    console.log(`Found ${events?.length || 0} game events referencing player`);
    
    if (!events || events.length === 0) {
      return false;
    }
    
    let statsCreated = false;
    
    for (const event of events) {
      if (event.event_type === 'goal' && event.details) {
        // Create goal stat if player is the scorer
        if (event.details.playerId === playerId) {
          try {
            await insertGameStat({
              gameId: event.game_id,
              playerId: playerId,
              statType: 'goals',
              period: event.period,
              value: 1,
              details: ''
            });
            statsCreated = true;
          } catch (error) {
            console.error("Error creating goal stat:", error);
          }
        }
        
        // Create assist stats
        if (event.details.primaryAssistId === playerId) {
          try {
            await insertGameStat({
              gameId: event.game_id,
              playerId: playerId,
              statType: 'assists',
              period: event.period,
              value: 1,
              details: 'primary'
            });
            statsCreated = true;
          } catch (error) {
            console.error("Error creating primary assist stat:", error);
          }
        }
        
        if (event.details.secondaryAssistId === playerId) {
          try {
            await insertGameStat({
              gameId: event.game_id,
              playerId: playerId,
              statType: 'assists',
              period: event.period,
              value: 1,
              details: 'secondary'
            });
            statsCreated = true;
          } catch (error) {
            console.error("Error creating secondary assist stat:", error);
          }
        }
        
        // Create plus/minus stat if player was on ice
        if (event.details.playersOnIce && 
            Array.isArray(event.details.playersOnIce) && 
            event.details.playersOnIce.includes(playerId)) {
          try {
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
          } catch (error) {
            console.error("Error creating plus/minus stat:", error);
          }
        }
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error("Error creating stats from events:", error);
    return false;
  }
};
