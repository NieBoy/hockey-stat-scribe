
import { supabase } from "@/lib/supabase";
import { TeamMemberData } from "../types/teamMember";
import { processTeamMembersByRole } from "../utils/teamRoleProcessing";

export const getTeamMembers = async (teamId: string): Promise<TeamMemberData[]> => {
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
  
  // Transform the response to match TeamMemberData type
  const transformedMembers: TeamMemberData[] = teamMembers?.map(member => ({
    ...member,
    users: member.users ? {
      id: (member.users as any).id,
      name: (member.users as any).name,
      email: (member.users as any).email
    } : null
  })) || [];
  
  return transformedMembers;
};

export { processTeamMembersByRole };
