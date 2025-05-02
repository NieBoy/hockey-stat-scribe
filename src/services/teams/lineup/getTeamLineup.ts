
import { supabase } from "@/lib/supabase";

export const getTeamLineup = async (teamId: string): Promise<any[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided for lineup fetch");
      return [];
    }

    console.log("Fetching team lineup for team:", teamId);

    // Get ALL team members with their positions, ensuring we get the correct IDs
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
      throw error;
    }

    console.log("Retrieved team lineup data:", data?.length || 0, "players");
    console.log("Player data details:", data?.map(p => ({
      id: p.id,
      user_id: p.user_id,
      name: p.name,
      position: p.position,
      line: p.line_number
    })));
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamLineup:", error);
    return [];
  }
};
