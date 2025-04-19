
import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';

export const fetchGameStats = async (gameId: string, playerId?: string): Promise<GameStat[]> => {
  try {
    console.log(`Fetching game stats for game: ${gameId || 'all'}, player: ${playerId || 'all'}`);
    
    let query = supabase.from('game_stats').select('*');
    
    if (gameId) {
      query = query.eq('game_id', gameId);
    }
    
    if (playerId) {
      query = query.eq('player_id', playerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching game stats:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} game stats`);
    
    return data?.map(stat => ({
      id: stat.id,
      gameId: stat.game_id,
      playerId: stat.player_id,
      statType: stat.stat_type,
      period: stat.period,
      timestamp: new Date(stat.timestamp),
      value: stat.value,
      details: stat.details || ''
    })) || [];
  } catch (error) {
    console.error("Error in fetchGameStats:", error);
    throw error;
  }
};

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    // First verify that the player exists
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('id', stat.playerId);
      
    if (!count) {
      console.error(`Player ID ${stat.playerId} does not exist in team_members table`);
      throw new Error(`Player ID ${stat.playerId} does not exist`);
    }
    
    // Use RPC instead of direct insert to ensure timestamp is properly set
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: stat.playerId,
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });
    
    if (error) {
      console.error("Error inserting game stat:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in insertGameStat:", error);
    throw error;
  }
};

export const deleteGameStat = async (statId: string) => {
  try {
    const { error } = await supabase.from('game_stats').delete().eq('id', statId);
    
    if (error) {
      console.error("Error deleting game stat:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteGameStat:", error);
    throw error;
  }
};

export const recordPlusMinusStats = async (
  gameId: string,
  playerIds: string[],
  period: number,
  isPositive: boolean
) => {
  try {
    console.log(`Recording ${isPositive ? 'plus' : 'minus'} for players:`, playerIds);
    
    // First verify that all players exist
    const { data: validPlayers, error: validationError } = await supabase
      .from('team_members')
      .select('id')
      .in('id', playerIds);
      
    if (validationError) {
      console.error("Error validating players:", validationError);
      throw new Error("Failed to validate players");
    }
    
    const validPlayerIds = validPlayers.map(p => p.id);
    const invalidPlayers = playerIds.filter(id => !validPlayerIds.includes(id));
    
    if (invalidPlayers.length > 0) {
      console.error("Invalid player IDs for plus/minus:", invalidPlayers);
      console.log("Will only record stats for valid players:", validPlayerIds);
      // Continue with only valid players
      playerIds = validPlayerIds;
    }
    
    if (playerIds.length === 0) {
      console.warn("No valid players to record plus/minus stats for");
      return false;
    }
    
    const statPromises = playerIds.map(playerId => 
      insertGameStat({
        gameId,
        playerId,
        statType: 'plusMinus',
        period,
        value: 1,
        details: isPositive ? 'plus' : 'minus'
      })
    );
    
    await Promise.all(statPromises);
    console.log(`Successfully recorded ${isPositive ? 'plus' : 'minus'} stats for ${playerIds.length} players`);
    return true;
  } catch (error) {
    console.error("Error recording plus/minus stats:", error);
    throw error;
  }
};

// Helper function to create game stats from game events that reference a player
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
    
    // Process goal events
    let statsCreated = false;
    
    for (const event of events) {
      if (event.event_type === 'goal' && event.details) {
        // Create goal stat if player is the scorer
        if (event.details.playerId === playerId) {
          try {
            console.log(`Creating goal stat for player ${playerId} from event ${event.id}`);
            
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
        
        // Create assist stat if player is primary or secondary assist
        if (event.details.primaryAssistId === playerId) {
          try {
            console.log(`Creating primary assist stat for player ${playerId} from event ${event.id}`);
            
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
            console.log(`Creating secondary assist stat for player ${playerId} from event ${event.id}`);
            
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
        
        // Create plus/minus stat if player was on the ice
        if (event.details.playersOnIce && Array.isArray(event.details.playersOnIce) && 
            event.details.playersOnIce.includes(playerId)) {
          try {
            console.log(`Creating plus/minus stat for player ${playerId} from event ${event.id}`);
            
            // Determine if it's a plus or minus based on team type and player's team
            const { data: playerData } = await supabase
              .from('team_members')
              .select('team_id')
              .eq('id', playerId)
              .single();
              
            // Get the game to determine team types
            const { data: gameData } = await supabase
              .from('games')
              .select('home_team_id, away_team_id')
              .eq('id', event.game_id)
              .single();
              
            if (playerData && gameData) {
              const isPlayerOnHomeTeam = playerData.team_id === gameData.home_team_id;
              const isHomeTeamScoring = event.team_type === 'home';
              
              // If player's team is scoring, it's a plus, otherwise a minus
              const isPlus = (isPlayerOnHomeTeam && isHomeTeamScoring) || 
                            (!isPlayerOnHomeTeam && !isHomeTeamScoring);
                            
              await insertGameStat({
                gameId: event.game_id,
                playerId: playerId,
                statType: 'plusMinus',
                period: event.period,
                value: 1,
                details: isPlus ? 'plus' : 'minus'
              });
              
              statsCreated = true;
            }
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
