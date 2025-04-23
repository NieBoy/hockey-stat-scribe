
import { supabase } from "@/lib/supabase";

export const createGameStatsFromEvents = async (playerId: string, events: any[]): Promise<boolean> => {
  try {
    console.log(`Creating game stats from ${events.length} events for player ${playerId}`);
    
    let statsCreated = false;
    
    // Process each event
    for (const event of events) {
      console.log(`Processing event:`, event);
      
      // Convert details to proper format if needed
      const details = typeof event.details === 'string' 
        ? JSON.parse(event.details) 
        : event.details;
        
      if (event.event_type === 'goal') {
        // Process goal event
        const result = await processGoalEvent(event, playerId, details);
        statsCreated = result || statsCreated;
        console.log(`Goal event processing result: ${result ? 'Stats created' : 'No stats created'}`);
      } else if (event.event_type === 'penalty') {
        // Process penalty event
        const result = await processPenaltyEvent(event, playerId, details);
        statsCreated = result || statsCreated;
        console.log(`Penalty event processing result: ${result ? 'Stats created' : 'No stats created'}`);
      } else if (event.event_type === 'faceoff') {
        // Process faceoff event
        const result = await processFaceoffEvent(event, playerId, details);
        statsCreated = result || statsCreated;
        console.log(`Faceoff event processing result: ${result ? 'Stats created' : 'No stats created'}`);
      }
      // Add other event types as needed
    }
    
    if (statsCreated) {
      console.log(`Successfully created stats from events for player ${playerId}`);
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

const createGameStat = async (
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  details: string = ''
): Promise<boolean> => {
  try {
    console.log(`Creating game stat: ${statType} for player ${playerId} in period ${period}`);
    
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
    // Get player's team info
    const { data: playerTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('id', playerId)
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
