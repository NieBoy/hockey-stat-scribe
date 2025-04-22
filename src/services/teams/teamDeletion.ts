
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

    // Step 1: Get all team members to identify players for later deletion
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

    // Step 2: Delete player-parent relationships for all team members
    if (memberIds.length > 0) {
      console.log("Deleting player-parent relationships");
      
      // Delete each player-parent relationship individually
      for (const memberId of memberIds) {
        try {
          const { error: parentRelationError } = await supabase
            .from('player_parents')
            .delete()
            .or(`player_id.eq.${memberId},parent_id.eq.${memberId}`);
            
          if (parentRelationError) {
            console.error(`Error deleting parent relationship for member ${memberId}:`, parentRelationError);
            // Continue anyway
          }
        } catch (error) {
          console.error(`Exception deleting parent relationship for member ${memberId}:`, error);
          // Continue anyway
        }
      }
    }

    // Step 3: Get all games where this team is either home or away
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

    // Step 4: Delete game events for all identified games
    if (gameIds.length > 0) {
      // Delete each game's data separately
      for (const gameId of gameIds) {
        try {
          // Step 4a: Get all game events for this game
          const { data: events, error: eventsQueryError } = await supabase
            .from('game_events')
            .select('id')
            .eq('game_id', gameId);

          if (eventsQueryError) {
            console.error(`Error retrieving game events for game ${gameId}:`, eventsQueryError);
            // Continue anyway
          }

          const eventIds = events?.map(event => event.id) || [];
          
          // Step 4b: Delete event_players records first (foreign key constraint)
          for (const eventId of eventIds) {
            try {
              const { error: eventPlayersError } = await supabase
                .from('event_players')
                .delete()
                .eq('event_id', eventId);

              if (eventPlayersError) {
                console.error(`Error deleting event players for event ${eventId}:`, eventPlayersError);
                // Continue anyway
              }
            } catch (error) {
              console.error(`Exception deleting event players for event ${eventId}:`, error);
              // Continue anyway
            }
          }

          // Step 4c: Delete game events
          const { error: eventsError } = await supabase
            .from('game_events')
            .delete()
            .eq('game_id', gameId);

          if (eventsError) {
            console.error(`Error deleting game events for game ${gameId}:`, eventsError);
            // Continue anyway
          }

          // Step 4d: Delete game stats
          const { error: gameStatsError } = await supabase
            .from('game_stats')
            .delete()
            .eq('game_id', gameId);

          if (gameStatsError) {
            console.error(`Error deleting game stats for game ${gameId}:`, gameStatsError);
            // Continue anyway
          }

          // Step 4e: Delete stat trackers
          const { error: trackersError } = await supabase
            .from('stat_trackers')
            .delete()
            .eq('game_id', gameId);

          if (trackersError) {
            console.error(`Error deleting stat trackers for game ${gameId}:`, trackersError);
            // Continue anyway
          }
        } catch (error) {
          console.error(`Exception processing game ${gameId}:`, error);
          // Continue anyway
        }
      }
    }

    // Step 5: Delete player stats for all team members with user_ids
    if (userIds.length > 0) {
      console.log("Deleting player stats");
      for (const userId of userIds) {
        try {
          const { error: playerStatsError } = await supabase
            .from('player_stats')
            .delete()
            .eq('player_id', userId);

          if (playerStatsError) {
            console.error(`Error deleting player stats for user ${userId}:`, playerStatsError);
            // Continue anyway
          }
        } catch (error) {
          console.error(`Exception deleting player stats for user ${userId}:`, error);
          // Continue anyway
        }
      }
    }

    // Step 6: Delete games
    if (gameIds.length > 0) {
      console.log("Deleting games one by one");
      for (const gameId of gameIds) {
        try {
          const { error: deleteGameError } = await supabase
            .from('games')
            .delete()
            .eq('id', gameId);

          if (deleteGameError) {
            console.error(`Error deleting game ${gameId}:`, deleteGameError);
            // Continue anyway
          }
        } catch (error) {
          console.error(`Exception deleting game ${gameId}:`, error);
          // Continue anyway
        }
      }
    }

    // Step 7: Delete team members one by one (workaround for RLS recursion issue)
    console.log("Deleting team members one by one");
    for (const memberId of memberIds) {
      try {
        // Important: Use a direct delete without any joins or complex queries
        // This avoids the infinite recursion in RLS policies
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId);
          
        if (error) {
          console.error(`Error deleting team member ${memberId}:`, error);
          // Continue with next member
        }
      } catch (memberError) {
        console.error(`Exception deleting team member ${memberId}:`, memberError);
        // Continue with next member
      }
    }

    // Step 8: Finally, delete the team itself
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
