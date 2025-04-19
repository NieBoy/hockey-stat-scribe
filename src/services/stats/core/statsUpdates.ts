
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

const updateOrInsertStat = async (
  playerId: string, 
  stat: Partial<PlayerStat>
) => {
  try {
    console.log(`Updating/inserting stat for player ${playerId}:`, stat);
    
    const { data: existingStat } = await supabase
      .from('player_stats')
      .select('id')
      .eq('player_id', playerId)
      .eq('stat_type', stat.statType)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Found existing stat with id ${existingStat.id}, updating...`);
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          value: stat.value,
          games_played: stat.gamesPlayed
        })
        .eq('id', existingStat.id);
        
      if (updateError) {
        console.error("Error updating player stat:", updateError);
        throw updateError;
      }
      
      console.log(`Successfully updated stat id ${existingStat.id}`);
    } else {
      console.log(`No existing stat found, inserting new stat...`);
      const { error: insertError } = await supabase
        .from('player_stats')
        .insert({
          player_id: playerId,
          stat_type: stat.statType,
          value: stat.value,
          games_played: stat.gamesPlayed
        });
        
      if (insertError) {
        console.error("Error inserting player stat:", insertError);
        throw insertError;
      }
      
      console.log(`Successfully inserted new stat for player ${playerId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateOrInsertStat for player ${playerId}:`, error);
    return false;
  }
};

// Create game stats from game events if they don't exist
const createGameStatsFromEvents = async (playerId: string, events: any[]): Promise<boolean> => {
  try {
    console.log(`Creating game stats from ${events.length} events for player ${playerId}`);
    
    let statsCreated = false;
    
    // Process goal events
    for (const event of events) {
      console.log(`Processing event type: ${event.event_type}`, event);
      
      if (event.event_type === 'goal' && event.details) {
        // Create goal stat if player is the scorer
        if (event.details.playerId === playerId) {
          console.log(`Creating goal stat for player ${playerId} from event ${event.id}`);
          
          const { data, error } = await supabase.rpc('record_game_stat', {
            p_game_id: event.game_id,
            p_player_id: playerId,
            p_stat_type: 'goals',
            p_period: event.period,
            p_value: 1,
            p_details: ''
          });
          
          if (error) {
            console.error("Error recording goal stat:", error);
          } else {
            console.log("Successfully created goal stat from event");
            statsCreated = true;
          }
        }
        
        // Create assist stat if player is primary or secondary assist
        if (event.details.primaryAssistId === playerId) {
          console.log(`Creating primary assist stat for player ${playerId} from event ${event.id}`);
          
          const { data, error } = await supabase.rpc('record_game_stat', {
            p_game_id: event.game_id,
            p_player_id: playerId,
            p_stat_type: 'assists',
            p_period: event.period,
            p_value: 1,
            p_details: 'primary'
          });
          
          if (error) {
            console.error("Error recording primary assist stat:", error);
          } else {
            console.log("Successfully created primary assist stat from event");
            statsCreated = true;
          }
        }
        
        if (event.details.secondaryAssistId === playerId) {
          console.log(`Creating secondary assist stat for player ${playerId} from event ${event.id}`);
          
          const { data, error } = await supabase.rpc('record_game_stat', {
            p_game_id: event.game_id,
            p_player_id: playerId,
            p_stat_type: 'assists',
            p_period: event.period,
            p_value: 1,
            p_details: 'secondary'
          });
          
          if (error) {
            console.error("Error recording secondary assist stat:", error);
          } else {
            console.log("Successfully created secondary assist stat from event");
            statsCreated = true;
          }
        }
        
        // Create plus/minus stat if player was on the ice
        if (event.details.playersOnIce && Array.isArray(event.details.playersOnIce) && 
            event.details.playersOnIce.includes(playerId)) {
          console.log(`Creating plus/minus stat for player ${playerId} from event ${event.id}`);
          
          // Determine if it's a plus or minus based on team type
          const isPlus = true; // This would typically depend on team comparison logic
          
          const { data, error } = await supabase.rpc('record_game_stat', {
            p_game_id: event.game_id,
            p_player_id: playerId,
            p_stat_type: 'plusMinus',
            p_period: event.period,
            p_value: 1,
            p_details: isPlus ? 'plus' : 'minus'
          });
          
          if (error) {
            console.error("Error recording plus/minus stat:", error);
          } else {
            console.log("Successfully created plus/minus stat from event");
            statsCreated = true;
          }
        }
      }
    }
    
    return statsCreated;
  } catch (error) {
    console.error("Error creating game stats from events:", error);
    return false;
  }
};

export const refreshPlayerStats = async (playerId: string): Promise<PlayerStat[]> => {
  console.log("refreshPlayerStats called for player:", playerId);
  try {
    // First, get player details to ensure we have a valid player
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('name, team_id')
      .eq('id', playerId)
      .single();
      
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      throw playerError;
    }
    
    const playerName = playerData?.name || 'Unknown Player';
    console.log("Found player:", playerName, "team_id:", playerData.team_id);
    
    // Look for events that reference this player in their details
    const { data: gameEvents, error: eventsError } = await supabase
      .from('game_events')
      .select('id, event_type, game_id, period, details, team_type')
      .or(`details->playerId.eq.${playerId},details->primaryAssistId.eq.${playerId},details->secondaryAssistId.eq.${playerId},details->playersOnIce.cs.{${playerId}}`);
      
    if (eventsError) {
      console.error("Error fetching game events:", eventsError);
    }
    
    console.log(`Found ${gameEvents?.length || 0} game events referencing player ${playerId}`);
    
    // Create game stats from events if needed (do this first before checking existing stats)
    let statsCreated = false;
    if (gameEvents && gameEvents.length > 0) {
      console.log("Checking if we need to create stats from events...");
      
      // Check if we already have stats for this player
      const { data: existingStats, error: existingStatsError } = await supabase
        .from('game_stats')
        .select('count')
        .eq('player_id', playerId)
        .single();
        
      if (existingStatsError && existingStatsError.code !== 'PGRST116') { // Not found error
        console.error("Error checking existing stats:", existingStatsError);
      }
      
      // If no stats exist, create them from events
      if (!existingStats || existingStats.count === 0) {
        console.log("No existing stats found, creating from events...");
        statsCreated = await createGameStatsFromEvents(playerId, gameEvents);
        console.log("Stats created from events:", statsCreated);
      }
    }
    
    // Query the game_stats table for this player specifically
    // We do this query after potentially creating stats to ensure we get the most up-to-date data
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('stat_type, value, game_id, period, details')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error("Error fetching game stats:", gameStatsError);
      throw gameStatsError;
    }
    
    console.log(`Found ${gameStats?.length || 0} raw game stats for player:`, gameStats);
    
    // If still no stats after attempted creation, return empty array
    if (!gameStats || gameStats.length === 0) {
      console.log("No game stats available after processing events");
      return [];
    }
    
    // Calculate stats summary by type
    const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
    gameStats.forEach(stat => {
      const statType = stat.stat_type;
      if (!statType) {
        console.warn("Ignoring stat with undefined stat_type:", stat);
        return;
      }
      
      const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
      
      currentStat.value += stat.value;
      currentStat.games.add(stat.game_id);
      
      statsSummary.set(statType, currentStat);
    });
    
    console.log("Stats summary:", Array.from(statsSummary.entries()).map(([key, val]) => 
      `${key}: ${val.value} (${val.games.size} games)`
    ));
    
    // Convert to PlayerStat array and update database
    const playerStats: PlayerStat[] = [];
    
    for (const [statType, data] of statsSummary.entries()) {
      const stat = {
        playerId,
        statType: statType as StatType,
        value: data.value,
        gamesPlayed: data.games.size,
        playerName
      };
      
      const updated = await updateOrInsertStat(playerId, stat);
      if (updated) {
        playerStats.push(stat as PlayerStat);
      }
    }
    
    console.log("Final processed stats:", playerStats);
    return playerStats;
  } catch (error) {
    console.error("Error refreshing player stats:", error);
    return [];
  }
};
