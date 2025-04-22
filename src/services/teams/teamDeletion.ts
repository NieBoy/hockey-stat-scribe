
import { supabase } from "@/lib/supabase";

/**
 * Delete a team and all associated data using direct SQL queries
 * This bypasses RLS policies to prevent recursion errors
 */
export const deleteTeamAndAllData = async (teamId: string): Promise<boolean> => {
  try {
    console.group(`Team Deletion Process for ${teamId}`);
    console.log("Starting team deletion process with direct queries");

    // Step 1: Delete player-parent relationships
    console.log("Step 1: Deleting player-parent relationships");
    
    const { error: relationshipsError } = await supabase.rpc(
      'delete_team_relationships',
      { team_id_param: teamId }
    );
    
    if (relationshipsError) {
      console.error("Error deleting relationships:", relationshipsError);
      console.groupEnd();
      return false;
    }
    
    // Step 2: Delete game-related data
    console.log("Step 2: Deleting game related data");
    
    const { error: gameDataError } = await supabase.rpc(
      'delete_team_game_data',
      { team_id_param: teamId }
    );
    
    if (gameDataError) {
      console.error("Error deleting game data:", gameDataError);
      console.groupEnd();
      return false;
    }
    
    // Step 3: Delete player stats
    console.log("Step 3: Deleting player stats");
    
    const { error: statsError } = await supabase.rpc(
      'delete_team_player_stats',
      { team_id_param: teamId }
    );
    
    if (statsError) {
      console.error("Error deleting player stats:", statsError);
      console.groupEnd();
      return false;
    }
    
    // Step 4: Delete team members
    console.log("Step 4: Deleting team members");
    
    const { error: membersError } = await supabase.rpc(
      'delete_team_members',
      { team_id_param: teamId }
    );
    
    if (membersError) {
      console.error("Error deleting team members:", membersError);
      console.groupEnd();
      return false;
    }
    
    // Step 5: Delete the team itself
    console.log("Step 5: Deleting the team");
    
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    
    if (teamError) {
      console.error("Error deleting team:", teamError);
      console.groupEnd();
      return false;
    }
    
    console.log("Team deletion completed successfully");
    console.groupEnd();
    return true;
  } catch (error) {
    console.error("Unexpected error during team deletion:", error);
    console.groupEnd();
    return false;
  }
};
