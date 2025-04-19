
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
        statsCreated = await processGoalEvent(event, playerId, details) || statsCreated;
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
    // Check if player is scorer
    if (details.playerId === playerId) {
      console.log(`Creating goal stat for player ${playerId}`);
      const goalStat = await createGameStat(event.game_id, playerId, 'goals', event.period);
      statsCreated = goalStat || statsCreated;
    }
    
    // Check for assists
    if (details.primaryAssistId === playerId) {
      console.log(`Creating primary assist stat for player ${playerId}`);
      const assistStat = await createGameStat(event.game_id, playerId, 'assists', event.period, 'primary');
      statsCreated = assistStat || statsCreated;
    }
    
    if (details.secondaryAssistId === playerId) {
      console.log(`Creating secondary assist stat for player ${playerId}`);
      const assistStat = await createGameStat(event.game_id, playerId, 'assists', event.period, 'secondary');
      statsCreated = assistStat || statsCreated;
    }
    
    // Check if player was on ice
    const playersOnIce = details.playersOnIce || [];
    if (Array.isArray(playersOnIce) && playersOnIce.includes(playerId)) {
      console.log(`Creating plus/minus stat for player ${playerId}`);
      const plusMinusStat = await createPlusMinus(event, playerId);
      statsCreated = plusMinusStat || statsCreated;
    }
    
    return statsCreated;
  } catch (error) {
    console.error(`Error processing goal event for player ${playerId}:`, error);
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
    
    // Create new stat
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
    
    console.log(`Successfully created ${statType} stat`);
    return true;
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
