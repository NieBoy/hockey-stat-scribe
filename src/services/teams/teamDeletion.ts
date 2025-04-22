
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
    // Start transaction by disabling auto-commit
    // This needs to be done step by step due to RLS and dependency constraints
    console.log(`Starting comprehensive deletion for team: ${teamId}`);

    // Step 1: Get all team members to identify players for later deletion
    const { data: teamMembers, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId);

    if (memberError) {
      console.error("Error retrieving team members:", memberError);
      toast.error("Failed to retrieve team members.");
      return false;
    }

    const memberIds = teamMembers.map(member => member.id);
    console.log(`Found ${memberIds.length} team members to remove`);

    // Step 2: Delete player-parent relationships for all team members
    if (memberIds.length > 0) {
      const { error: parentsError } = await supabase
        .from('player_parents')
        .delete()
        .in('player_id', memberIds)
        .or(`parent_id.in.(${memberIds.join(',')})`);

      if (parentsError) {
        console.error("Error deleting player-parent relationships:", parentsError);
        toast.error("Failed to delete player-parent relationships.");
        return false;
      }
    }

    // Step 3: Get all games where this team is either home or away
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id')
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    if (gamesError) {
      console.error("Error retrieving games:", gamesError);
      toast.error("Failed to retrieve games.");
      return false;
    }

    const gameIds = games.map(game => game.id);
    console.log(`Found ${gameIds.length} games to remove`);

    // Step 4: Delete game events for all identified games
    if (gameIds.length > 0) {
      // Step 4a: Delete event_players (required due to foreign key constraints)
      const { data: events, error: eventsQueryError } = await supabase
        .from('game_events')
        .select('id')
        .in('game_id', gameIds);

      if (eventsQueryError) {
        console.error("Error retrieving game events:", eventsQueryError);
        toast.error("Failed to retrieve game events.");
        return false;
      }

      const eventIds = events.map(event => event.id);
      
      if (eventIds.length > 0) {
        const { error: eventPlayersError } = await supabase
          .from('event_players')
          .delete()
          .in('event_id', eventIds);

        if (eventPlayersError) {
          console.error("Error deleting event players:", eventPlayersError);
          toast.error("Failed to delete event players.");
          return false;
        }
      }

      // Step 4b: Delete game events
      const { error: eventsError } = await supabase
        .from('game_events')
        .delete()
        .in('game_id', gameIds);

      if (eventsError) {
        console.error("Error deleting game events:", eventsError);
        toast.error("Failed to delete game events.");
        return false;
      }

      // Step 4c: Delete game stats
      const { error: gameStatsError } = await supabase
        .from('game_stats')
        .delete()
        .in('game_id', gameIds);

      if (gameStatsError) {
        console.error("Error deleting game stats:", gameStatsError);
        toast.error("Failed to delete game stats.");
        return false;
      }

      // Step 4d: Delete stat trackers
      const { error: trackersError } = await supabase
        .from('stat_trackers')
        .delete()
        .in('game_id', gameIds);

      if (trackersError) {
        console.error("Error deleting stat trackers:", trackersError);
        toast.error("Failed to delete stat trackers.");
        return false;
      }
    }

    // Step 5: Delete player stats for all team members
    if (memberIds.length > 0) {
      const { error: playerStatsError } = await supabase
        .from('player_stats')
        .delete()
        .in('player_id', memberIds);

      if (playerStatsError) {
        console.error("Error deleting player stats:", playerStatsError);
        toast.error("Failed to delete player stats.");
        return false;
      }
    }

    // Step 6: Delete games
    if (gameIds.length > 0) {
      const { error: deleteGamesError } = await supabase
        .from('games')
        .delete()
        .in('id', gameIds);

      if (deleteGamesError) {
        console.error("Error deleting games:", deleteGamesError);
        toast.error("Failed to delete games.");
        return false;
      }
    }

    // Step 7: Delete team members
    const { error: deleteMembersError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    if (deleteMembersError) {
      console.error("Error deleting team members:", deleteMembersError);
      toast.error("Failed to delete team members.");
      return false;
    }

    // Step 8: Finally, delete the team itself
    const { error: deleteTeamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteTeamError) {
      console.error("Error deleting team:", deleteTeamError);
      toast.error("Failed to delete team.");
      return false;
    }

    console.log(`Team ${teamId} and all associated data successfully deleted`);
    toast.success("Team and all associated data successfully deleted.");
    return true;

  } catch (error) {
    console.error("Unexpected error during team deletion:", error);
    toast.error("An unexpected error occurred during team deletion.");
    return false;
  }
};
