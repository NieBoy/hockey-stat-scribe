
import { supabase } from "@/lib/supabase";
import { Lines } from "@/types";

export const updateTeamLineup = async (
  teamId: string, 
  lines: Lines
): Promise<boolean> => {
  console.log("Updating team lineup", { teamId, lines });
  
  if (!teamId) {
    console.error("No team ID provided for lineup update");
    return false;
  }
  
  // First get all players for this team
  const { data: teamPlayers, error: fetchError } = await supabase
    .from('team_members')
    .select('user_id, position, line_number')
    .eq('team_id', teamId)
    .eq('role', 'player');
    
  if (fetchError) {
    console.error("Error fetching team players:", fetchError);
    return false;
  }
    
  // Prepare batch updates
  const updates = [];
  
  // Update forward lines
  for (const line of lines.forwards) {
    if (line.leftWing) {
      updates.push({
        team_id: teamId,
        user_id: line.leftWing.id,
        role: 'player',
        position: 'LW',
        line_number: line.lineNumber
      });
    }
    
    if (line.center) {
      updates.push({
        team_id: teamId,
        user_id: line.center.id,
        role: 'player',
        position: 'C',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightWing) {
      updates.push({
        team_id: teamId,
        user_id: line.rightWing.id,
        role: 'player',
        position: 'RW',
        line_number: line.lineNumber
      });
    }
  }
  
  // Update defense lines
  for (const line of lines.defense) {
    if (line.leftDefense) {
      updates.push({
        team_id: teamId,
        user_id: line.leftDefense.id,
        role: 'player',
        position: 'LD',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightDefense) {
      updates.push({
        team_id: teamId,
        user_id: line.rightDefense.id,
        role: 'player',
        position: 'RD',
        line_number: line.lineNumber
      });
    }
  }
  
  // Update goalies
  for (const goalie of lines.goalies) {
    updates.push({
      team_id: teamId,
      user_id: goalie.id,
      role: 'player',
      position: 'G',
      line_number: null
    });
  }
  
  console.log("Updates to apply:", updates);
  
  try {
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
      
    // Now apply all the updates one by one
    let successCount = 0;
    let errorCount = 0;
    
    if (updates.length > 0) {
      for (const update of updates) {
        console.log(`Updating player ${update.user_id} to position ${update.position} on line ${update.line_number}`);
        
        const { data, error } = await supabase
          .from('team_members')
          .update({
            position: update.position,
            line_number: update.line_number
          })
          .eq('team_id', update.team_id)
          .eq('user_id', update.user_id)
          .select();
          
        if (error) {
          console.error("Error updating player position:", error);
          console.error("Failed update data:", update);
          errorCount++;
        } else {
          console.log("Successfully updated player:", data);
          successCount++;
        }
      }
    }
    
    console.log(`Lineup update complete: ${successCount} successful, ${errorCount} failed`);
    return errorCount === 0;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};
