
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

/**
 * Adds a team member to a team
 * This new implementation doesn't require a user account
 */
export const addTeamMember = async (
  teamId: string, 
  memberData: {
    name: string,
    email?: string,
    role?: string,
    position?: string,
    lineNumber?: number | null
  }
): Promise<string> => {
  try {
    console.log(`Adding team member: ${memberData.name}, role=${memberData.role || 'player'}, to teamId=${teamId}`);
    
    const memberId = crypto.randomUUID();
    
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        id: memberId,
        team_id: teamId,
        user_id: null,
        role: memberData.role || 'player',
        position: memberData.position || null,
        line_number: memberData.lineNumber,
        name: memberData.name,
        email: memberData.email || null
      })
      .select();
      
    if (teamMemberError) {
      console.error("Error adding team member:", teamMemberError);
      
      if (teamMemberError.code === '23503') {
        if (teamMemberError.message.includes('team_members_team_id_fkey')) {
          throw new Error(`Cannot add member to team: Team ID ${teamId} does not exist`);
        }
      } else if (teamMemberError.message.includes('violates row-level security policy')) {
        throw new Error(`Row level security prevented adding team member. Please check permissions.`);
      }
      
      throw new Error(`Failed to add team member: ${teamMemberError.message}`);
    }
    
    console.log(`Successfully added ${memberData.role || 'player'} to team ${teamId}`);
    return memberId;
  } catch (error) {
    console.error("Error in addTeamMember:", error);
    throw error;
  }
};

