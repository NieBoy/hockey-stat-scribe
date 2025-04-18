
import { supabase } from "@/lib/supabase";

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

    // Get ALL team members regardless of whether they have positions
    const { data, error } = await supabase
      .from('team_members')
      .select('id, user_id, position, line_number, name, email, role')
      .eq('team_id', teamId)
      .eq('role', 'player');

    if (error) {
      console.error("Error fetching team lineup:", error);
      return [];
    }

    console.log("Retrieved team lineup data:", data);
    
    // Log detailed position information if we have data
    if (data?.length > 0) {
      logLineupDetails(data);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamLineup:", error);
    return [];
  }
};

const logLineupDetails = (data: any[]) => {
  // Count players by position
  const positions = data.reduce((acc, player) => {
    if (player.position) {
      acc[player.position] = (acc[player.position] || 0) + 1;
    } else {
      acc["unassigned"] = (acc["unassigned"] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Count players by line number
  const lineNumbers = data.reduce((acc, player) => {
    if (player.line_number) {
      acc[player.line_number] = (acc[player.line_number] || 0) + 1;
    } else {
      acc["unassigned"] = (acc["unassigned"] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log("Position breakdown:", positions);
  console.log("Line number breakdown:", lineNumbers);
  
  // Create unique position+line combinations to verify lineup integrity
  const positionLines = data
    .filter(p => p.position && p.line_number)
    .map(p => `${p.position}-Line${p.line_number}`);
  
  console.log("Position+Line combinations:", positionLines);
};
