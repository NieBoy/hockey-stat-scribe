
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
    
    return teams as Team[] || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};
