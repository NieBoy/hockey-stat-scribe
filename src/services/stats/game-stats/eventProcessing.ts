
import { supabase } from '@/lib/supabase';

// This function processes game events and creates stats from them
export const createStatsFromEvents = async (playerId: string, events?: any[]) => {
  try {
    console.log("Creating stats from events for player:", playerId);
    
    // Verify the player exists in team_members
    const { data: playerData, error: playerError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('id', playerId)
      .single();
      
    if (playerError) {
      console.error("Player not found in team_members:", playerError);
      throw new Error(`Player ${playerId} not found in team_members table`);
    }
    
    console.log("Found player in team_members:", playerData);
    
    // If events aren't provided, fetch them
    if (!events) {
      console.log("No events provided, fetching events for player:", playerId);
      const { data: fetchedEvents, error: eventsError } = await supabase
        .from('game_events')
        .select(`
          id, 
          game_id, 
          event_type, 
          period, 
          team_type, 
          timestamp,
          details
        `)
        .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId},details->playersOnIce.cs.{${playerId}}`);
        
      if (eventsError) {
        console.error("Error fetching events for player:", eventsError);
        throw eventsError;
      }
      
      events = fetchedEvents;
      console.log(`Found ${events?.length || 0} events for player ${playerId}`);
    }
    
    if (!events || events.length === 0) {
      console.log("No events found for player, nothing to process");
      return false;
    }
    
    // Process each event type
    let statsCreated = 0;
    
    // Process goals
    const goalEvents = events.filter(event => event.event_type === 'goal');
    for (const event of goalEvents) {
      const details = event.details || {};
      
      // Record goal for the scorer
      if (details.playerId === playerId) {
        console.log(`Recording goal for player ${playerId} in game ${event.game_id}, period ${event.period}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'goals',
          period: event.period,
          value: 1
        });
        statsCreated++;
      }
      
      // Record primary assist
      if (details.primaryAssistId === playerId) {
        console.log(`Recording primary assist for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'assists',
          period: event.period,
          value: 1,
          details: 'primary'
        });
        statsCreated++;
      }
      
      // Record secondary assist
      if (details.secondaryAssistId === playerId) {
        console.log(`Recording secondary assist for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'assists',
          period: event.period,
          value: 1,
          details: 'secondary'
        });
        statsCreated++;
      }
      
      // Record plus for all players on ice
      if (details.playersOnIce && Array.isArray(details.playersOnIce)) {
        if (details.playersOnIce.includes(playerId)) {
          console.log(`Recording plus for player ${playerId} who was on ice`);
          await recordStat({
            gameId: event.game_id,
            playerId: playerId,
            statType: 'plusMinus',
            period: event.period,
            value: 1,
            details: 'plus'
          });
          statsCreated++;
        }
      }
    }
    
    // Process shots
    const shotEvents = events.filter(event => event.event_type === 'shot');
    for (const event of shotEvents) {
      const details = event.details || {};
      
      if (details.playerId === playerId) {
        console.log(`Recording shot for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'shots',
          period: event.period,
          value: 1
        });
        statsCreated++;
      }
      
      // Record save for goalie
      if (details.goalieId === playerId) {
        console.log(`Recording save for goalie ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'saves',
          period: event.period,
          value: 1
        });
        statsCreated++;
      }
    }
    
    // Process faceoffs
    const faceoffEvents = events.filter(event => event.event_type === 'faceoff');
    for (const event of faceoffEvents) {
      const details = event.details || {};
      
      if (details.winnerId === playerId) {
        console.log(`Recording faceoff win for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'faceoffs',
          period: event.period,
          value: 1,
          details: 'won'
        });
        statsCreated++;
      } else if (details.loserId === playerId) {
        console.log(`Recording faceoff loss for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'faceoffs',
          period: event.period,
          value: 0,
          details: 'lost'
        });
        statsCreated++;
      }
    }
    
    // Process hits
    const hitEvents = events.filter(event => event.event_type === 'hit');
    for (const event of hitEvents) {
      const details = event.details || {};
      
      if (details.playerId === playerId) {
        console.log(`Recording hit for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'hits',
          period: event.period,
          value: 1
        });
        statsCreated++;
      }
    }
    
    // Process penalties
    const penaltyEvents = events.filter(event => event.event_type === 'penalty');
    for (const event of penaltyEvents) {
      const details = event.details || {};
      
      if (details.playerId === playerId) {
        console.log(`Recording penalty for player ${playerId}`);
        await recordStat({
          gameId: event.game_id,
          playerId: playerId,
          statType: 'penalties',
          period: event.period,
          value: 1,
          details: details.type || 'minor'
        });
        statsCreated++;
      }
    }
    
    console.log(`Created ${statsCreated} stats for player ${playerId}`);
    return statsCreated > 0;
  } catch (error) {
    console.error("Error in createStatsFromEvents:", error);
    throw error;
  }
};

// Helper function to record a stat
async function recordStat({
  gameId,
  playerId,
  statType,
  period,
  value,
  details = ''
}: {
  gameId: string,
  playerId: string,
  statType: string,
  period: number,
  value: number,
  details?: string
}) {
  try {
    // Check if this stat already exists to avoid duplicates
    const { data: existingStat } = await supabase
      .from('game_stats')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .eq('stat_type', statType)
      .eq('period', period)
      .eq('details', details)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Stat already exists, skipping: ${statType} for player ${playerId} in game ${gameId}`);
      return;
    }
    
    // Record the stat directly using team_member.id as player_id
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: gameId,
      p_player_id: playerId,
      p_stat_type: statType,
      p_period: period,
      p_value: value,
      p_details: details
    });
    
    if (error) {
      console.error("Error recording stat:", error);
      throw error;
    }
    
    console.log(`Successfully recorded ${statType} stat for player ${playerId}`);
    return data;
  } catch (error) {
    console.error("Error in recordStat:", error);
    throw error;
  }
}
