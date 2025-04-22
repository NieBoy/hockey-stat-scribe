
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";
import { getTeamMembers, processTeamMembersByRole } from "./teamMembers";

export const getTeams = async (): Promise<Team[]> => {
  console.log("Fetching teams with no-cache headers...");
  
  try {
    // Use the most aggressive no-cache options possible
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id, 
        name
      `)
      .throwOnError();

    if (teamsError) {
      console.error("Error fetching teams from Supabase:", teamsError);
      throw teamsError;
    }
    
    console.log("Teams data from DB:", teamsData);
    
    if (!teamsData || teamsData.length === 0) {
      console.log("No teams found in database");
      return [];
    }
    
    const teams: Team[] = [];
    
    for (const team of teamsData) {
      try {
        // Double-check that this team still exists
        const { count, error } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('id', team.id);
          
        if (error || count === 0) {
          console.log(`Team ${team.id} no longer exists, skipping...`);
          continue;
        }
        
        const teamMembers = await getTeamMembers(team.id);
        const { players, coaches, parents } = processTeamMembersByRole(teamMembers);
        
        teams.push({
          id: team.id,
          name: team.name,
          players,
          coaches,
          parents
        });
      } catch (error) {
        console.error(`Error processing team ${team.id}:`, error);
        continue;
      }
    }
    
    console.log("Processed teams with members:", teams);
    return teams;
  } catch (error) {
    console.error("Error in getTeams:", error);
    throw error;
  }
};
