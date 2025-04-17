
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";

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
    
    // Generate a unique ID for the team member entry
    const memberId = crypto.randomUUID();
    
    // Add the team member directly without requiring a user account
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        id: memberId,
        team_id: teamId,
        user_id: null, // This will be null for players without accounts
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
        // Foreign key violation
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
        name,
        email,
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
export const removeTeamMember = async (teamId: string, memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('id', memberId);
      
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

/**
 * Removes a team member and any related records
 * Fixed to prevent infinite recursion in RLS policies
 */
export const deleteTeamMember = async (memberId: string): Promise<boolean> => {
  try {
    console.log("Deleting team member:", memberId);
    
    // First retrieve any parent-player relationships to delete them directly
    const { data: relations, error: relationsError } = await supabase
      .from('player_parents')
      .select('*')
      .or(`parent_id.eq.${memberId},player_id.eq.${memberId}`);
      
    if (relationsError) {
      console.error("Error retrieving parent-player relations:", relationsError);
      throw relationsError;
    }
    
    // Delete the relations directly if any exist
    if (relations && relations.length > 0) {
      for (const relation of relations) {
        const { error: deleteRelationError } = await supabase
          .from('player_parents')
          .delete()
          .eq('parent_id', relation.parent_id)
          .eq('player_id', relation.player_id);
          
        if (deleteRelationError) {
          console.error("Error deleting relation:", deleteRelationError);
          throw deleteRelationError;
        }
      }
    }
    
    // Then delete the team member
    const { error: memberError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
      
    if (memberError) {
      console.error("Error deleting team member:", memberError);
      throw memberError;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteTeamMember:", error);
    throw error;
  }
};
