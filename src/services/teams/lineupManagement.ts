
import { supabase } from "@/lib/supabase";
import { Lines } from "@/types";

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
    // First get all players for this team
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
      
    // Prepare batch updates
    const updates = [];
    
    // Update forward lines
    lines.forwards.forEach(line => {
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
    });
    
    // Update defense lines
    lines.defense.forEach(line => {
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
    });
    
    // Update goalies
    lines.goalies.forEach((goalie, index) => {
      updates.push({
        team_id: teamId,
        user_id: goalie.id,
        role: 'player',
        position: 'G',
        line_number: index + 1  // Added line numbers for goalies to distinguish starting vs backup
      });
    });
    
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
      
    // Now apply all the updates one by one
    let successCount = 0;
    let errorCount = 0;
    
    if (updates.length > 0) {
      for (const update of updates) {
        console.log(`Updating player ${update.user_id} to position ${update.position} on line ${update.line_number}`);
        
        // Check if update.user_id exists and is not null/undefined
        if (!update.user_id) {
          console.error("Invalid user_id in update:", update);
          errorCount++;
          continue;
        }
        
        // Check if this is a valid team_member record
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
    return errorCount === 0;
  } catch (error) {
    console.error("Error updating team lineup:", error);
    return false;
  }
};

// Enhanced getTeamLineup function to fetch more complete data and provide better logging
export const getTeamLineup = async (teamId: string): Promise<any[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided for lineup fetch");
      return [];
    }

    console.log("Fetching team lineup for team:", teamId);

    // First check if any players have position data set
    const { data: positionCheck, error: checkError } = await supabase
      .from('team_members')
      .select('count(*)')
      .eq('team_id', teamId)
      .eq('role', 'player')
      .not('position', 'is', null);
      
    if (checkError) {
      console.error("Error checking for player positions:", checkError);
    } else {
      console.log("Players with positions:", positionCheck);
    }

    // Make sure we get ALL players with positions, even if position is null
    // This ensures we have complete data for building the lineup
    const { data, error } = await supabase
      .from('team_members')
      .select('user_id, name, position, line_number')
      .eq('team_id', teamId)
      .eq('role', 'player');

    if (error) {
      console.error("Error fetching team lineup:", error);
      return [];
    }

    console.log("Retrieved team lineup data:", data);
    
    // Log the breakdown of player positions
    if (data && data.length > 0) {
      const positions = data.reduce((acc, player) => {
        if (player.position) {
          acc[player.position] = (acc[player.position] || 0) + 1;
        } else {
          acc["unassigned"] = (acc["unassigned"] || 0) + 1;
        }
        return acc;
      }, {});
      
      console.log("Position breakdown:", positions);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamLineup:", error);
    return [];
  }
};
