
import { supabase } from "@/lib/supabase";

/**
 * Gets complete lineup data for a team
 * @param teamId The team ID to fetch lineup for
 * @returns Array of team members with names, positions, and other details
 */
export const getTeamLineup = async (teamId: string): Promise<any[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided for lineup fetch");
      return [];
    }

    console.log("Fetching team lineup for team:", teamId);

    // Get ALL team members, including those without positions
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        position,
        line_number,
        name,
        email,
        role
      `)
      .eq('team_id', teamId)
      .eq('role', 'player');

    if (error) {
      console.error("Error fetching team lineup:", error);
      return [];
    }

    console.log("Retrieved team lineup data:", data);
    
    // Return the full player data array - each player uses team_member.id as its primary identifier
    return data || [];
  } catch (error) {
    console.error("Error in getTeamLineup:", error);
    return [];
  }
};
