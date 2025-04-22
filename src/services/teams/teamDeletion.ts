
import { supabase } from "@/lib/supabase";

/**
 * Delete a team and all associated data
 * This is a comprehensive deletion that removes:
 * - Team members (players, coaches, parents)
 * - Player-parent relationships
 * - Game events and stats
 * - Games associated with the team
 * - Player stats
 * - The team itself
 */
export const deleteTeamAndAllData = async (teamId: string): Promise<boolean> => {
  try {
    console.log(`Starting comprehensive deletion for team: ${teamId}`);

    // Step 1: Get all team members
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('id, user_id')
      .eq('team_id', teamId);

    if (memberError) {
      console.error("Error retrieving team members:", memberError);
      return false;
    }

    const memberIds = teamMembers?.map(member => member.id) || [];
    const userIds = teamMembers?.map(member => member.user_id).filter(Boolean) || [];
    console.log(`Found ${memberIds.length} team members to remove`);

    // Step 2: Delete player-parent relationships
    if (memberIds.length > 0) {
      console.log("Deleting player-parent relationships");
      
      // Get all relationships involving team members
      const { data: relationships, error: relationshipsError } = await supabase
        .from('player_parents')
        .select('*')
        .in('player_id', memberIds)
        .or(`parent_id.in.(${memberIds.join(',')})`);
        
      if (relationshipsError) {
        console.error("Error getting player-parent relationships:", relationshipsError);
        // Continue anyway
      }
      
      // Delete relationships one by one to avoid RLS issues
      if (relationships && relationships.length > 0) {
        for (const rel of relationships) {
          try {
            await supabase
              .from('player_parents')
              .delete()
              .eq('id', rel.id);
          } catch (error) {
            console.error(`Error deleting relationship ${rel.id}:`, error);
            // Continue with next relationship
          }
        }
      }
    }

    // Step 3: Find all games associated with this team
    console.log("Finding games associated with team");
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    if (gamesError) {
      console.error("Error retrieving games:", gamesError);
      // Continue anyway - we can still delete the team
    }

    const gameIds = games?.map(game => game.id) || [];
    console.log(`Found ${gameIds.length} games to remove`);

    // Step 4: Process game data
    for (const gameId of gameIds) {
      try {
        // Step 4a: Delete stat trackers
        await supabase
          .from('stat_trackers')
          .delete()
          .eq('game_id', gameId);
          
        // Step 4b: Delete game stats
        await supabase
          .from('game_stats')
          .delete()
          .eq('game_id', gameId);
        
        // Step 4c: Get event IDs
        const { data: events } = await supabase
          .from('game_events')
          .select('id')
          .eq('game_id', gameId);
        
        // Step 4d: Delete event players for each event
        if (events && events.length > 0) {
          for (const event of events) {
            await supabase
              .from('event_players')
              .delete()
              .eq('event_id', event.id);
          }
        }
        
        // Step 4e: Delete game events
        await supabase
          .from('game_events')
          .delete()
          .eq('game_id', gameId);
          
        // Step 4f: Delete the game
        await supabase
          .from('games')
          .delete()
          .eq('id', gameId);
          
      } catch (gameError) {
        console.error(`Error processing game ${gameId}:`, gameError);
        // Continue with next game
      }
    }

    // Step 5: Delete player stats
    if (userIds.length > 0) {
      console.log("Deleting player stats");
      for (const userId of userIds) {
        if (userId) {
          try {
            await supabase
              .from('player_stats')
              .delete()
              .eq('player_id', userId);
          } catch (error) {
            console.error(`Error deleting stats for user ${userId}:`, error);
            // Continue anyway
          }
        }
      }
    }

    // Step 6: Delete team members one by one (crucial to avoid RLS recursion)
    console.log("Deleting team members one by one");
    for (const memberId of memberIds) {
      try {
        // Direct, simple delete without RLS complexity
        const { error: memberDeleteError } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId)
          // Important: No joins, filters, or anything that might trigger recursion
          .single();
          
        if (memberDeleteError) {
          console.error(`Error deleting member ${memberId}:`, memberDeleteError);
          // Continue with next member
        }
      } catch (error) {
        console.error(`Exception deleting member ${memberId}:`, error);
        // Continue with next member
      }
    }

    // Step 7: Finally, delete the team itself
    console.log("Deleting team");
    const { error: deleteTeamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteTeamError) {
      console.error("Error deleting team:", deleteTeamError);
      return false;
    }

    console.log(`Team ${teamId} and all associated data successfully deleted`);
    return true;
  } catch (error) {
    console.error("Unexpected error during team deletion:", error);
    return false;
  }
};
