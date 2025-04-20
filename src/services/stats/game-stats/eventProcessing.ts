
import { supabase } from '@/lib/supabase';
import { insertGameStat } from './creation';
import { calculatePlusMinus } from './plusMinus';

export const createStatsFromEvents = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Creating game stats from events for player: ${playerId}`);
    
    // First verify player exists in team_members table
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name, user_id, email')
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
    
    // If player doesn't have a user_id, try to find or create one based on email
    let userId = playerData.user_id;
    
    if (!userId && playerData.email) {
      console.log(`Player ${playerId} has no user_id but has email ${playerData.email}, trying to find or create user`);
      
      // First check if a user exists with this email
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users')
        .select('id')
        .eq('email', playerData.email)
        .maybeSingle();
        
      if (existingUserError) {
        console.error("Error checking for existing user:", existingUserError);
      }
      
      if (existingUser?.id) {
        // User exists, link the player to this user
        userId = existingUser.id;
        console.log(`Found existing user ${userId} with email ${playerData.email}`);
        
        // Update the player's user_id
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ user_id: userId })
          .eq('id', playerId);
          
        if (updateError) {
          console.error("Error updating player user_id:", updateError);
        } else {
          console.log(`Updated player ${playerId} with user_id ${userId}`);
        }
      } else {
        // No existing user, create a new one
        try {
          const { data: newUser, error: createError } = await supabase
            .rpc('create_player_user', { 
              player_name: playerData.name || 'Player', 
              player_email: playerData.email 
            });
            
          if (createError) {
            console.error("Error creating new user:", createError);
          } else if (newUser) {
            userId = newUser;
            console.log(`Created new user ${userId} for player ${playerId}`);
            
            // Update the player's user_id
            const { error: updateError } = await supabase
              .from('team_members')
              .update({ user_id: userId })
              .eq('id', playerId);
              
            if (updateError) {
              console.error("Error updating player user_id after creation:", updateError);
            } else {
              console.log(`Updated player ${playerId} with new user_id ${userId}`);
            }
          }
        } catch (error) {
          console.error("Error in create_player_user rpc call:", error);
        }
      }
    }
    
    if (!userId) {
      console.error(`Player ${playerId} (${playerData.name}) exists but has no user_id and no email to create one`);
      throw new Error(`Player ID ${playerId} does not have a valid user_id association and no email to create one`);
    }
    
    console.log(`Processing stats for player name: ${playerData.name}, user_id: ${userId}`);
    
    // Get all game events that reference this player
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
              .eq('player_id', userId) // Use user_id for checking existing stats
              .eq('stat_type', 'goals')
              .eq('period', event.period)
              .maybeSingle();
              
            if (!existingStat) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: userId, // Use user_id for creating stats
                statType: 'goals',
                period: event.period,
                value: 1,
                details: ''
              });
              statsCreated = true;
              console.log(`Added goal stat for player ${playerId} (user ${userId})`);
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
              .eq('player_id', userId) // Use user_id for checking existing stats
              .eq('stat_type', 'assists')
              .eq('period', event.period)
              .eq('details', 'primary')
              .maybeSingle();
              
            if (!existingAssist) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: userId, // Use user_id for creating stats
                statType: 'assists',
                period: event.period,
                value: 1,
                details: 'primary'
              });
              statsCreated = true;
              console.log(`Added primary assist stat for player ${playerId} (user ${userId})`);
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
              .eq('player_id', userId) // Use user_id for checking existing stats
              .eq('stat_type', 'assists')
              .eq('period', event.period)
              .eq('details', 'secondary')
              .maybeSingle();
              
            if (!existingAssist) {
              await insertGameStat({
                gameId: event.game_id,
                playerId: userId, // Use user_id for creating stats
                statType: 'assists',
                period: event.period,
                value: 1,
                details: 'secondary'
              });
              statsCreated = true;
              console.log(`Added secondary assist stat for player ${playerId} (user ${userId})`);
            } else {
              console.log(`Secondary assist stat already exists for this event`);
            }
          } catch (error) {
            console.error("Error creating secondary assist stat:", error);
          }
        }
        
        // Process plus/minus for players on ice during a goal
        if (Array.isArray(details.playersOnIce) && details.playersOnIce.includes(playerId)) {
          try {
            // We need to determine if this is a plus or minus for the player
            // Get the player's team ID
            const { data: playerTeam } = await supabase
              .from('team_members')
              .select('team_id')
              .eq('id', playerId)
              .single();
              
            if (playerTeam) {
              // Get the game to determine home/away team
              const { data: game } = await supabase
                .from('games')
                .select('home_team_id, away_team_id')
                .eq('id', event.game_id)
                .single();
                
              if (game) {
                const isHomeTeam = playerTeam.team_id === game.home_team_id;
                const isHomeTeamGoal = event.team_type === 'home';
                
                // Player gets a plus if their team scored, minus if the opponent scored
                const isPlus = isHomeTeam === isHomeTeamGoal;
                
                // Check if plus/minus stat already exists
                const { data: existingPlusMinus } = await supabase
                  .from('game_stats')
                  .select('id')
                  .eq('game_id', event.game_id)
                  .eq('player_id', userId)
                  .eq('stat_type', 'plusMinus')
                  .eq('period', event.period)
                  .eq('details', isPlus ? 'plus' : 'minus')
                  .maybeSingle();
                  
                if (!existingPlusMinus) {
                  await insertGameStat({
                    gameId: event.game_id,
                    playerId: userId,
                    statType: 'plusMinus',
                    period: event.period,
                    value: 1,
                    details: isPlus ? 'plus' : 'minus'
                  });
                  statsCreated = true;
                  console.log(`Added ${isPlus ? 'plus' : 'minus'} stat for player ${playerId} (user ${userId})`);
                } else {
                  console.log(`Plus/minus stat already exists for this event`);
                }
              }
            }
          } catch (error) {
            console.error("Error creating plus/minus stat:", error);
          }
        }
      }
    }
    
    // After processing all events, refresh player stats
    if (statsCreated) {
      try {
        // Update aggregate player stats
        const { data, error } = await supabase.rpc('refresh_player_stats', { player_id: userId });
        if (error) {
          console.error("Error calling refresh_player_stats function:", error);
          
          // Fallback: Let's manually refresh player stats by summing game_stats
          console.log("Falling back to manual stats aggregation...");
          await manuallyRefreshPlayerStats(userId);
        } else {
          console.log("Successfully refreshed aggregated player stats via RPC");
        }
      } catch (error) {
        console.error("Error updating aggregated player stats:", error);
        
        // Try manual fallback
        await manuallyRefreshPlayerStats(userId);
      }
    }
    
    console.log(`Stats creation process completed. Created stats: ${statsCreated}`);
    return statsCreated;
  } catch (error) {
    console.error("Error creating stats from events:", error);
    return false;
  }
};

// Manual fallback for refreshing player stats by aggregating game_stats
const manuallyRefreshPlayerStats = async (userId: string): Promise<boolean> => {
  try {
    console.log(`Manually refreshing player stats for user ${userId}`);
    
    // Get all game stats for this player
    const { data: gameStats, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', userId);
      
    if (error) {
      console.error("Error fetching game stats for aggregation:", error);
      return false;
    }
    
    if (!gameStats || gameStats.length === 0) {
      console.log("No game stats found to aggregate");
      return false;
    }
    
    console.log(`Found ${gameStats.length} game stats to aggregate`);
    
    // Group stats by type for aggregation
    const statsByType: Record<string, {
      value: number;
      gameIds: Set<string>;
    }> = {};
    
    for (const stat of gameStats) {
      if (!statsByType[stat.stat_type]) {
        statsByType[stat.stat_type] = {
          value: 0,
          gameIds: new Set()
        };
      }
      
      statsByType[stat.stat_type].value += stat.value;
      statsByType[stat.stat_type].gameIds.add(stat.game_id);
    }
    
    console.log("Aggregated stats by type:", statsByType);
    
    // Update player_stats table with aggregated values
    for (const [statType, stats] of Object.entries(statsByType)) {
      // Check if stat already exists
      const { data: existingStat } = await supabase
        .from('player_stats')
        .select('id')
        .eq('player_id', userId)
        .eq('stat_type', statType)
        .maybeSingle();
        
      if (existingStat) {
        // Update existing stat
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            value: stats.value,
            games_played: stats.gameIds.size
          })
          .eq('id', existingStat.id);
          
        if (updateError) {
          console.error(`Error updating ${statType} stat:`, updateError);
        } else {
          console.log(`Updated ${statType} stat: ${stats.value} across ${stats.gameIds.size} games`);
        }
      } else {
        // Create new stat
        const { error: insertError } = await supabase
          .from('player_stats')
          .insert({
            player_id: userId,
            stat_type: statType,
            value: stats.value,
            games_played: stats.gameIds.size
          });
          
        if (insertError) {
          console.error(`Error inserting ${statType} stat:`, insertError);
        } else {
          console.log(`Inserted new ${statType} stat: ${stats.value} across ${stats.gameIds.size} games`);
        }
      }
    }
    
    console.log("Manual player stats refresh completed successfully");
    return true;
  } catch (error) {
    console.error("Error in manual player stats refresh:", error);
    return false;
  }
};
