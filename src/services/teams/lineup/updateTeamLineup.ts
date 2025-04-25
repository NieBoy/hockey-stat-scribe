
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
    // Start a transaction for all our updates
    const updates = prepareUpdates(teamId, lines);
    console.log("Updates to apply:", updates);
    
    if (updates.length === 0) {
      console.log("No updates needed");
      return true;
    }
    
    // Track all user IDs that should have positions
    const updatedUserIds = updates.map(update => update.user_id);
    
    // Apply all player position updates
    let allUpdatesSuccessful = true;
    
    for (const update of updates) {
      if (!update.user_id) {
        console.error("Invalid user_id in update:", update);
        continue;
      }
      
      // Important: We're updating the team_members table using user_id field, not id field
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
      } else {
        console.log(`Successfully updated player ${update.user_id} to position ${update.position} on line ${update.line_number}`);
      }
    }
    
    // Clear positions for players not in the lineup
    if (updatedUserIds.length > 0) {
      const { error: clearError } = await supabase
        .from('team_members')
        .update({
          position: null,
          line_number: null
        })
        .eq('team_id', teamId)
        .eq('role', 'player')
        .not('user_id', 'in', updatedUserIds);
        
      if (clearError) {
        console.error("Error clearing unused player positions:", clearError);
        allUpdatesSuccessful = false;
      } else {
        console.log("Successfully cleared positions for players not in the lineup");
      }
    }
    
    return allUpdatesSuccessful;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};
