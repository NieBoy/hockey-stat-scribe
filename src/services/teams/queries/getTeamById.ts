
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";
import { getTeamMembers, processTeamMembersByRole } from "./teamMembers";

export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id, 
        name
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching team ${id}:`, error);
      throw error;
    }
    
    const teamMembers = await getTeamMembers(id);
    const { players, coaches, parents } = processTeamMembersByRole(teamMembers);
    
    return {
      id: data.id,
      name: data.name,
      players,
      coaches,
      parents
    };
  } catch (error) {
    console.error(`Error in getTeamById for team ${id}:`, error);
    throw error;
  }
};
