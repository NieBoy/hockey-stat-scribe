
import { supabase } from "@/lib/supabase";

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

