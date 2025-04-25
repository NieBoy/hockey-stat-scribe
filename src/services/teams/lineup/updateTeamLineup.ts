
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
    
    // Reset positions in a single update
    const { error: resetError } = await supabase
      .from('team_members')
      .update({
        position: null,
        line_number: null
      })
      .eq('team_id', teamId)
      .eq('role', 'player');
      
    if (resetError) {
      console.error("Error resetting positions:", resetError);
      return false;
    }
    
    // Apply all updates in batches of 10
    const batchSize = 10;
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
          return false;
        }
      }
    }
    
    console.log("Successfully updated all positions");
    return true;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};
