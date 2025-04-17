
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";

/**
 * Adds a team member to a team
 */
export const addTeamMember = async (
  teamId: string, 
  userId: string, 
  role: string = 'player',
  position?: string,
  lineNumber?: number | null
): Promise<boolean> => {
  try {
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: role,
        position: position || null,
        line_number: lineNumber
      })
      .select();
      
    if (teamMemberError) {
      console.error("Error adding team member:", teamMemberError);
      throw teamMemberError;
    }
    
    return true;
  } catch (error) {
    console.error("Error in addTeamMember:", error);
    throw error;
  }
};

/**
 * Updates a team member's information
 */
export const updateTeamMemberInfo = async (
  teamId: string,
  userId: string,
  memberData: {
    position?: string;
    number?: string;
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
    
    if (Object.keys(updateData).length === 0) {
      return true;
    }
    
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('team_id', teamId)
      .eq('user_id', userId);
      
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

/**
 * Gets all team members for a team
 */
export const getTeamMembers = async (teamId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        position,
        line_number
      `)
      .eq('team_id', teamId)
      .order('role');
      
    if (error) {
      console.error(`Error fetching team members for ${teamId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamMembers:", error);
    throw error;
  }
};

/**
 * Removes a team member from a team
 */
export const removeTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeTeamMember:", error);
    throw error;
  }
};
