
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
      const { error: parentsError } = await supabase
        .from('player_parents')
        .delete()
        .in('player_id', memberIds);

      if (parentsError) {
        console.error("Error deleting player-parent relationships:", parentsError);
        return false;
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
      return false;
    }

    const gameIds = games?.map(game => game.id) || [];
    console.log(`Found ${gameIds.length} games to remove`);

    // Step 4: Delete game events for all identified games
    if (gameIds.length > 0) {
      // Step 4a: Get all game events for these games
      console.log("Retrieving game events");
      const { data: events, error: eventsQueryError } = await supabase
        .from('game_events')
        .select('id')
        .in('game_id', gameIds);

      if (eventsQueryError) {
        console.error("Error retrieving game events:", eventsQueryError);
        return false;
      }

      const eventIds = events?.map(event => event.id) || [];
      console.log(`Found ${eventIds.length} game events to remove`);
      
      // Step 4b: Delete event_players records first (foreign key constraint)
      if (eventIds.length > 0) {
        console.log("Deleting event players");
        const { error: eventPlayersError } = await supabase
          .from('event_players')
          .delete()
          .in('event_id', eventIds);

        if (eventPlayersError) {
          console.error("Error deleting event players:", eventPlayersError);
          return false;
        }
      }

      // Step 4c: Delete game events
      console.log("Deleting game events");
      const { error: eventsError } = await supabase
        .from('game_events')
        .delete()
        .in('game_id', gameIds);

      if (eventsError) {
        console.error("Error deleting game events:", eventsError);
        return false;
      }

      // Step 4d: Delete game stats
      console.log("Deleting game stats");
      const { error: gameStatsError } = await supabase
        .from('game_stats')
        .delete()
        .in('game_id', gameIds);

      if (gameStatsError) {
        console.error("Error deleting game stats:", gameStatsError);
        return false;
      }

      // Step 4e: Delete stat trackers
      console.log("Deleting stat trackers");
      const { error: trackersError } = await supabase
        .from('stat_trackers')
        .delete()
        .in('game_id', gameIds);

      if (trackersError) {
        console.error("Error deleting stat trackers:", trackersError);
        return false;
      }
    }

    // Step 5: Delete player stats for all team members with user_ids
    if (userIds.length > 0) {
      console.log("Deleting player stats");
      const { error: playerStatsError } = await supabase
        .from('player_stats')
        .delete()
        .in('player_id', userIds);

      if (playerStatsError) {
        console.error("Error deleting player stats:", playerStatsError);
        return false;
      }
    }

    // Step 6: Delete games
    if (gameIds.length > 0) {
      console.log("Deleting games");
      const { error: deleteGamesError } = await supabase
        .from('games')
        .delete()
        .in('id', gameIds);

      if (deleteGamesError) {
        console.error("Error deleting games:", deleteGamesError);
        return false;
      }
    }

    // Step 7: Delete team members
    console.log("Deleting team members");
    const { error: deleteMembersError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    if (deleteMembersError) {
      console.error("Error deleting team members:", deleteMembersError);
      return false;
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
