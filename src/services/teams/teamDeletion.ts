
import { supabase } from "@/integrations/supabase/client";

/**
 * Delete a team and all associated data using direct SQL queries.
 * Uses security definer stored procedures to handle RLS.
 */
export const deleteTeamAndAllData = async (teamId: string): Promise<boolean> => {
  try {
    console.group(`Team Deletion Process for ${teamId}`);
    console.log("Deleting player-parent relationships…");
    const { error: relationshipsError } = await supabase.rpc('delete_team_relationships', { team_id_param: teamId });
    if (relationshipsError) {
      console.error("Error deleting relationships:", relationshipsError);
      console.groupEnd();
      return false;
    }

    console.log("Deleting game related data…");
    const { error: gameDataError } = await supabase.rpc('delete_team_game_data', { team_id_param: teamId });
    if (gameDataError) {
      console.error("Error deleting game data:", gameDataError);
      console.groupEnd();
      return false;
    }

    console.log("Deleting player stats…");
    const { error: statsError } = await supabase.rpc('delete_team_player_stats', { team_id_param: teamId });
    if (statsError) {
      console.error("Error deleting player stats:", statsError);
      console.groupEnd();
      return false;
    }

    console.log("Deleting all team members…");
    const { error: membersError } = await supabase.rpc('delete_team_members', { team_id_param: teamId });
    if (membersError) {
      console.error("Error deleting team members:", membersError);
      console.groupEnd();
      return false;
    }

    console.log("Deleting the team row itself…");
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (teamError) {
      console.error("Error deleting the team object:", teamError);
      console.groupEnd();
      return false;
    }

    console.log("Team deletion completed successfully.");
    console.groupEnd();
    return true;
  } catch (error) {
    console.error("Unexpected error during team deletion:", error);
    console.groupEnd();
    return false;
  }
};
