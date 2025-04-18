
import { supabase } from "@/lib/supabase";
import { Lines } from "@/types";
import { prepareUpdates } from "./lineupUtils";

export const updateTeamLineup = async (
  teamId: string, 
  lines: Lines
): Promise<boolean> => {
  console.log("Updating team lineup", { teamId });
  console.log("Lineup data structure:", JSON.stringify(lines, null, 2));
  
  if (!teamId) {
    console.error("No team ID provided for lineup update");
    return false;
  }
  
  try {
    // Get existing team members first
    const { data: teamPlayers, error: fetchError } = await supabase
      .from('team_members')
      .select('id, user_id, position, line_number')
      .eq('team_id', teamId)
      .eq('role', 'player');
      
    if (fetchError) {
      console.error("Error fetching team players:", fetchError);
      return false;
    }

    console.log("Current team players:", teamPlayers);
    
    // Prepare batch updates using utility function
    const updates = prepareUpdates(teamId, lines);
    console.log("Updates to apply:", updates);
    
    // First reset all positions to ensure clean slate
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
    
    console.log("Successfully reset all positions");
    
    // Apply all updates
    let successCount = 0;
    let errorCount = 0;
    
    if (updates.length > 0) {
      for (const update of updates) {
        console.log(`Updating player ${update.user_id} to position ${update.position} on line ${update.line_number}`);
        
        if (!update.user_id) {
          console.error("Invalid user_id in update:", update);
          errorCount++;
          continue;
        }
        
        // Verify team member record exists
        const { data: teamMember, error: checkError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', update.team_id)
          .eq('user_id', update.user_id)
          .eq('role', 'player')
          .single();
          
        if (checkError || !teamMember) {
          console.error("Player not found in team_members:", update.user_id);
          console.error("Error:", checkError);
          errorCount++;
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
          errorCount++;
        } else {
          console.log("Successfully updated player position");
          successCount++;
        }
      }
    }
    
    console.log(`Lineup update complete: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount > 0) {
      console.log(`Saved lineup structure for ${teamId}:`, {
        forwards: lines.forwards.length,
        defense: lines.defense.length,
        goalies: lines.goalies.length,
        totalUpdatedPositions: successCount
      });
    }
    
    return errorCount === 0;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};
