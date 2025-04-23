
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";

export const getTeams = async (): Promise<Team[]> => {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id, 
        name,
        created_at
      `)
      .order('name');

    if (error) throw error;
    
    // Map the data to include empty players array to match Team type
    return (teams || []).map(team => ({
      id: team.id,
      name: team.name,
      players: [], // Adding empty players array to match the Team type
      created_at: team.created_at
    })) as Team[];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};
