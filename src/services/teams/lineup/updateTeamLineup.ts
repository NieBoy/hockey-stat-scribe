
import { supabase } from "@/lib/supabase";
import { Lines } from "@/types";
import { prepareUpdates } from "./lineupUtils";

export const updateTeamLineup = async (
  teamId: string, 
  lines: Lines
): Promise<boolean> => {
  console.log("Updating team lineup", { teamId });
  
  if (!teamId) {
    console.error("No team ID provided for lineup update");
    return false;
  }
  
  try {
    // Get existing team members first to validate
    const { data: teamPlayers, error: fetchError } = await supabase
      .from('team_members')
      .select('id, user_id, position, line_number')
      .eq('team_id', teamId)
      .eq('role', 'player');
      
    if (fetchError) {
      console.error("Error fetching team players:", fetchError);
      return false;
    }

    // Prepare batch updates
    const updates = prepareUpdates(teamId, lines);
    console.log("Updates to apply:", updates);
    
    if (updates.length === 0) {
      console.log("No updates needed");
      return true;
    }
    
    // IMPORTANT CHANGE: Instead of resetting all positions first, we'll update them directly
    // This avoids the issue of clearing positions and then failing to apply new ones
    
    // Apply all updates in batches of 10
    const batchSize = 10;
    let allUpdatesSuccessful = true;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        if (!update.user_id) {
          console.error("Invalid user_id in update:", update);
          continue;
        }
        
        const { error } = await supabase
          .from('team_members')
          .update({
            position: update.position,
            line_number: update.line_number
          })
          .eq('team_id', update.team_id)
          .eq('user_id', update.user_id);
          
        if (error) {
          console.error("Error updating player position:", error);
          console.error("Failed update data:", update);
          allUpdatesSuccessful = false;
          // Continue with other updates even if one fails
        }
      }
    }
    
    // For players not in the lineup, clear their positions
    // First identify all player IDs that are part of the update
    const updatedPlayerIds = updates.map(update => update.user_id);
    
    // Then clear positions for all players not in the updates
    const { error: clearError } = await supabase
      .from('team_members')
      .update({
        position: null,
        line_number: null
      })
      .eq('team_id', teamId)
      .eq('role', 'player')
      .not('user_id', 'in', updatedPlayerIds);
      
    if (clearError) {
      console.error("Error clearing unused player positions:", clearError);
      allUpdatesSuccessful = false;
    }
    
    console.log("Successfully updated all positions");
    return allUpdatesSuccessful;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};
