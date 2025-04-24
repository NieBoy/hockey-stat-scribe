
import { supabase } from "@/lib/supabase";
import { validatePlayerId } from "@/services/events/shared/validatePlayer";

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
        
        if (event.event_type === 'goal') {
          // Process goal event
          result = await processGoalEvent(event, playerId, details);
          console.log(`Goal event processing result: ${result ? 'Stats created' : 'No stats created'}`);
        } else if (event.event_type === 'penalty') {
          // Process penalty event
          result = await processPenaltyEvent(event, playerId, details);
          console.log(`Penalty event processing result: ${result ? 'Stats created' : 'No stats created'}`);
        } else if (event.event_type === 'faceoff') {
          // Process faceoff event
          result = await processFaceoffEvent(event, playerId, details);
          console.log(`Faceoff event processing result: ${result ? 'Stats created' : 'No stats created'}`);
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

const processGoalEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
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

const processPenaltyEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    // Check if this player took the penalty
    if (details && details.playerId === playerId) {
      console.log(`Player ${playerId} took a penalty`);
      const penaltyStat = await createGameStat(event.game_id, playerId, 'penalties', event.period);
      
      // If there's PIM (penalty minutes) data, record that too
      if (details.pim) {
        await createGameStat(event.game_id, playerId, 'pim', event.period, details.pim);
      }
      
      return penaltyStat;
    }
    return false;
  } catch (error) {
    console.error(`Error processing penalty event:`, error);
    return false;
  }
};

const processFaceoffEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    if (!details) return false;
    
    // Check if player was involved in the faceoff
    if (details.winnerId === playerId || details.loserId === playerId) {
      const won = details.winnerId === playerId;
      console.log(`Player ${playerId} ${won ? 'won' : 'lost'} a faceoff`);
      
      return await createGameStat(
        event.game_id,
        playerId,
        'faceoffs',
        event.period,
        won ? 'won' : 'lost'
      );
    }
    return false;
  } catch (error) {
    console.error(`Error processing faceoff event:`, error);
    return false;
  }
};

/**
 * Creates a game stat record
 * @param gameId The ID of the game
 * @param playerId The team_member.id of the player
 * @param statType Type of stat
 * @param period Game period
 * @param details Optional details
 * @returns Promise<boolean> Success status
 */
const createGameStat = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  details: string = ''
): Promise<boolean> => {
  try {
    console.log(`Creating game stat: ${statType} for player ${playerId} in period ${period}, game ${gameId}`);
    
    // Validate that player ID exists in team_members
    const isValid = await validatePlayerId(playerId);
    if (!isValid) {
      console.error(`Cannot create stat: Player ID ${playerId} not found in team_members table`);
      return false;
    }
    
    // First check if stat already exists
    const { data: existingStat } = await supabase
      .from('game_stats')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .eq('stat_type', statType)
      .eq('period', period)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Stat already exists for ${statType} in period ${period}`);
      return true;
    }
    
    // Create new stat using RPC function for maximum compatibility
    try {
      const { data, error } = await supabase.rpc('record_game_stat', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_stat_type: statType,
        p_period: period,
        p_value: 1,
        p_details: details
      });
      
      if (error) {
        console.error(`Error creating ${statType} stat using RPC:`, error);
        throw error;
      }
      
      console.log(`Successfully created ${statType} stat for player ${playerId} using RPC`);
      return true;
    } catch (rpcError) {
      console.error(`RPC failed, trying direct insert:`, rpcError);
      
      // Fallback to direct insert if RPC fails
      const { error } = await supabase
        .from('game_stats')
        .insert({
          game_id: gameId,
          player_id: playerId,
          stat_type: statType,
          period: period,
          value: 1,
          details: details,
          timestamp: new Date().toISOString()
        });
        
      if (error) {
        console.error(`Error creating ${statType} stat:`, error);
        return false;
      }
      
      console.log(`Successfully created ${statType} stat for player ${playerId}`);
      return true;
    }
  } catch (error) {
    console.error(`Error in createGameStat:`, error);
    return false;
  }
};

const createPlusMinus = async (event: any, playerId: string): Promise<boolean> => {
  try {
    // Get player's team info from team_members table
    const { data: playerTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)  // Using team_member.id consistently
      .single();
      
    if (!playerTeam) {
      console.error(`Could not find team for player ${playerId}`);
      return false;
    }
    
    // Get game info to determine if it's a plus or minus
    const { data: game } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('id', event.game_id)
      .single();
      
    if (!game) {
      console.error(`Could not find game ${event.game_id}`);
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
