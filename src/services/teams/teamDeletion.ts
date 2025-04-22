
import { supabase } from "@/lib/supabase";

/**
 * Delete a team and all associated data using a sequential, methodical approach
 * This function follows a strict order of operations to prevent RLS issues
 */
export const deleteTeamAndAllData = async (teamId: string): Promise<boolean> => {
  try {
    // Start a console group to make logs more readable
    console.group(`Team Deletion Process: ${teamId}`);
    console.log("Starting methodical team deletion process");
    
    // Step 1: Get all required IDs first to minimize database calls later
    console.log("Step 1: Getting all required IDs");
    
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('id, user_id')
      .eq('team_id', teamId);
      
    if (memberError) {
      console.error("Error retrieving team members:", memberError);
      console.groupEnd();
      return false;
    }
    
    const memberIds = teamMembers?.map(member => member.id) || [];
    const userIds = teamMembers?.map(member => member.user_id).filter(Boolean) || [];
    
    console.log(`Found ${memberIds.length} team members to process`);
    
    // Step 2: Find games associated with this team
    console.log("Step 2: Finding games associated with team");
    
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
      
    if (gamesError) {
      console.error("Error retrieving games:", gamesError);
      // Don't exit - we can continue with partial deletion
    }
    
    const gameIds = games?.map(game => game.id) || [];
    console.log(`Found ${gameIds.length} games to remove`);
    
    // Step 3: Delete player-parent relationships 
    console.log("Step 3: Deleting player-parent relationships");
    
    if (memberIds.length > 0) {
      const { data: relationships, error: relError } = await supabase
        .from('player_parents')
        .select('id')
        .in('player_id', memberIds)
        .or(`parent_id.in.(${memberIds.join(',')})`);
        
      if (relError) {
        console.error("Error finding player-parent relationships:", relError);
      } else {
        console.log(`Found ${relationships?.length || 0} player-parent relationships`);
        
        // Delete relationships one by one
        for (const rel of relationships || []) {
          const { error: delRelError } = await supabase
            .from('player_parents')
            .delete()
            .eq('id', rel.id);
            
          if (delRelError) {
            console.error(`Error deleting relationship ${rel.id}:`, delRelError);
          }
        }
      }
    }
    
    // Step 4: Process game data in a strictly sequential manner
    console.log("Step 4: Processing game data");
    
    for (const gameId of gameIds) {
      console.log(`Processing game: ${gameId}`);
      
      // Step 4a: Delete stat trackers
      const { error: statTrackerError } = await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);
        
      if (statTrackerError) {
        console.error(`Error deleting stat trackers for game ${gameId}:`, statTrackerError);
      }
      
      // Step 4b: Delete game stats
      const { error: statsError } = await supabase
        .from('game_stats')
        .delete()
        .eq('game_id', gameId);
        
      if (statsError) {
        console.error(`Error deleting game stats for game ${gameId}:`, statsError);
      }
      
      // Step 4c: Find and delete event players
      const { data: events } = await supabase
        .from('game_events')
        .select('id')
        .eq('game_id', gameId);
        
      if (events && events.length > 0) {
        console.log(`Found ${events.length} events for game ${gameId}`);
        
        for (const event of events) {
          const { error: eventPlayersError } = await supabase
            .from('event_players')
            .delete()
            .eq('event_id', event.id);
            
          if (eventPlayersError) {
            console.error(`Error deleting event players for event ${event.id}:`, eventPlayersError);
          }
        }
      }
      
      // Step 4d: Delete game events
      const { error: eventsError } = await supabase
        .from('game_events')
        .delete()
        .eq('game_id', gameId);
        
      if (eventsError) {
        console.error(`Error deleting events for game ${gameId}:`, eventsError);
      }
      
      // Step 4e: Delete the game
      const { error: gameDeleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
        
      if (gameDeleteError) {
        console.error(`Error deleting game ${gameId}:`, gameDeleteError);
      }
    }
    
    // Step 5: Delete player stats
    console.log("Step 5: Deleting player stats");
    
    if (userIds.length > 0) {
      for (const userId of userIds) {
        if (userId) {
          const { error: statsError } = await supabase
            .from('player_stats')
            .delete()
            .eq('player_id', userId);
            
          if (statsError) {
            console.error(`Error deleting stats for player ${userId}:`, statsError);
          }
        }
      }
    }
    
    // Step 6: Delete team members ONE BY ONE to avoid RLS issues
    console.log("Step 6: Deleting team members one by one");
    
    let allMembersDeleted = true;
    
    for (const memberId of memberIds) {
      const { error: memberDeleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
      if (memberDeleteError) {
        console.error(`Error deleting team member ${memberId}:`, memberDeleteError);
        allMembersDeleted = false;
      }
    }
    
    if (!allMembersDeleted) {
      console.warn("Not all team members were deleted successfully");
    }
    
    // Step 7: Finally, delete the team
    console.log("Step 7: Deleting team");
    
    const { error: teamDeleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
      
    if (teamDeleteError) {
      console.error("Error deleting team:", teamDeleteError);
      console.groupEnd();
      return false;
    }
    
    console.log(`Team ${teamId} successfully deleted`);
    console.groupEnd();
    return true;
  } catch (error) {
    console.error("Unexpected error during team deletion:", error);
    console.groupEnd();
    return false;
  }
};
