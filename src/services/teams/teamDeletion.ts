
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
    // Try to delete the team with a more explicit approach
    // Use a type assertion to bypass the TypeScript limitation with dynamic RPC function names
    const { error: deleteError } = await supabase.rpc(
      'delete_team_completely' as any, 
      { team_id_param: teamId }
    );
    
    // If the RPC call fails, fall back to direct deletion
    if (deleteError) {
      console.warn("RPC delete_team_completely failed, falling back to direct deletion:", deleteError);
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (teamError) {
        console.error("Error deleting the team object:", teamError);
        console.groupEnd();
        return false;
      }
    }

    // Verify the team was actually deleted
    const { count, error: verifyError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('id', teamId);

    if (verifyError) {
      console.error("Error verifying team deletion:", verifyError);
      console.groupEnd();
      return false;
    }

    // If count > 0, the team still exists
    if (count && count > 0) {
      console.error("Team still exists after deletion attempt!");
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
