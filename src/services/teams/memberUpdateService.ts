
import { supabase } from "@/lib/supabase";

/**
 * Updates a team member's information
 */
export const updateTeamMemberInfo = async (
  teamId: string,
  memberId: string,
  memberData: {
    position?: string;
    number?: string;
    name?: string;
    email?: string;
  }
): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (memberData.position !== undefined) {
      updateData.position = memberData.position;
    }
    
    if (memberData.number !== undefined) {
      updateData.line_number = memberData.number ? parseInt(memberData.number, 10) : null;
    }
    
    if (memberData.name !== undefined) {
      updateData.name = memberData.name;
    }
    
    if (memberData.email !== undefined) {
      updateData.email = memberData.email;
    }
    
    if (Object.keys(updateData).length === 0) {
      return true;
    }
    
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('team_id', teamId)
      .eq('id', memberId);
      
    if (teamMemberError) {
      console.error("Error updating team member:", teamMemberError);
      throw teamMemberError;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateTeamMemberInfo:", error);
    throw error;
  }
};
