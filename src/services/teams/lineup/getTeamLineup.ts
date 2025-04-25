
import { supabase } from "@/lib/supabase";

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
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamLineup:", error);
    return [];
  }
};
