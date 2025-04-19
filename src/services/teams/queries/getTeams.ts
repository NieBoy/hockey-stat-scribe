
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";
import { getTeamMembers, processTeamMembersByRole } from "./teamMembers";

export const getTeams = async (): Promise<Team[]> => {
  console.log("Fetching teams...");
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id, 
        name
      `);

    if (teamsError) {
      console.error("Error fetching teams from Supabase:", teamsError);
      throw teamsError;
    }
    
    console.log("Teams data from DB:", teamsData);
    
    const teams: Team[] = [];
    
    for (const team of teamsData || []) {
      try {
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
