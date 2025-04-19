
import { supabase } from "@/lib/supabase";
import { TeamMemberData, processTeamMember } from "../types/teamMember";

export const getTeamMembers = async (teamId: string) => {
  const { data: teamMembers, error: membersError } = await supabase
    .from('team_members')
    .select(`
      id,
      user_id,
      role,
      position,
      line_number,
      name,
      email,
      users:user_id (
        id, 
        name, 
        email
      )
    `)
    .eq('team_id', teamId);
    
  if (membersError) {
    console.error(`Error fetching members for team ${teamId}:`, membersError);
    throw membersError;
  }
  
  return teamMembers as TeamMemberData[];
};

export const processTeamMembersByRole = (members: TeamMemberData[]) => {
  const players = members
    .filter(member => member.role === 'player')
    .map(p => processTeamMember(p, 'Unknown Player'));
  
  const coaches = members
    .filter(member => member.role === 'coach')
    .map(c => processTeamMember(c, 'Unknown Coach'));
    
  const parents = members
    .filter(member => member.role === 'parent')
    .map(p => processTeamMember(p, 'Unknown Parent'));
    
  return { players, coaches, parents };
};
