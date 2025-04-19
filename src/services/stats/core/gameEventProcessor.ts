
import { supabase } from "@/lib/supabase";

export const createGameStatsFromEvents = async (playerId: string, events: any[]): Promise<boolean> => {
  try {
    console.log(`Creating game stats from ${events.length} events for player ${playerId}`);
    
    let statsCreated = false;
    
    // Process goal events
    for (const event of events) {
      console.log(`Processing event type: ${event.event_type}`, event);
      
      if (event.event_type === 'goal' && event.details) {
        statsCreated = await processGoalEvent(event, playerId) || statsCreated;
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error("Error creating game stats from events:", error);
    return false;
  }
};

const processGoalEvent = async (event: any, playerId: string): Promise<boolean> => {
  let statsCreated = false;
  
  // Log the details to better understand the structure
  console.log("Processing goal event details:", event.details);
  
  // Process scorer
  if (event.details.playerId === playerId) {
    console.log("Player is the scorer, creating goal stat");
    statsCreated = await createGameStat(event, playerId, 'goals') || statsCreated;
  }
  
  // Process primary assist
  if (event.details.primaryAssistId === playerId) {
    console.log("Player has primary assist, creating assist stat");
    statsCreated = await createGameStat(event, playerId, 'assists', 'primary') || statsCreated;
  }
  
  // Process secondary assist
  if (event.details.secondaryAssistId === playerId) {
    console.log("Player has secondary assist, creating assist stat");
    statsCreated = await createGameStat(event, playerId, 'assists', 'secondary') || statsCreated;
  }
  
  // Process plus/minus
  if (Array.isArray(event.details.playersOnIce) && event.details.playersOnIce.includes(playerId)) {
    console.log("Player is on ice, creating plus/minus stat");
    statsCreated = await createPlusMinusStat(event, playerId) || statsCreated;
  }
  
  return statsCreated;
};

const createGameStat = async (
  event: any,
  playerId: string,
  statType: string,
  details: string = ''
): Promise<boolean> => {
  try {
    console.log(`Creating ${statType} stat for player ${playerId} from event:`, event.id);
    
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: event.game_id,
      p_player_id: playerId,
      p_stat_type: statType,
      p_period: event.period,
      p_value: 1,
      p_details: details
    });
    
    if (error) {
      console.error(`Error recording ${statType} stat:`, error);
      return false;
    }
    
    console.log(`Successfully created ${statType} stat from event`);
    return true;
  } catch (error) {
    console.error(`Error creating ${statType} stat:`, error);
    return false;
  }
};

const createPlusMinusStat = async (event: any, playerId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would determine if it's a plus or minus based on team comparison
    const isPlus = true;
    
    const { error } = await supabase.rpc('record_game_stat', {
      p_game_id: event.game_id,
      p_player_id: playerId,
      p_stat_type: 'plusMinus',
      p_period: event.period,
      p_value: 1,
      p_details: isPlus ? 'plus' : 'minus'
    });
    
    if (error) {
      console.error("Error recording plus/minus stat:", error);
      return false;
    }
    
    console.log("Successfully created plus/minus stat from event");
    return true;
  } catch (error) {
    console.error("Error creating plus/minus stat:", error);
    return false;
  }
};
