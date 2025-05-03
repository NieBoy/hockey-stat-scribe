
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";

export const addRoleToUser = async (userId: string, role: UserRole): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Check if the user already has this role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing role:", checkError);
      return { success: false, error: "Failed to check existing roles" };
    }
    
    // If role doesn't exist, add it
    if (!existingRole) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });
        
      if (insertError) {
        console.error("Error adding role:", insertError);
        return { success: false, error: "Failed to add role" };
      }
      
      console.log(`Role ${role} added to user ${userId} successfully`);
      return { success: true, error: null };
    }
    
    return { success: true, error: null }; // Role already exists
  } catch (error: any) {
    console.error("Add role error:", error);
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
};

export const removeRoleFromUser = async (userId: string, role: UserRole): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) {
      console.error("Error removing role:", error);
      return { success: false, error: "Failed to remove role" };
    }
    
    console.log(`Role ${role} removed from user ${userId} successfully`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Remove role error:", error);
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
};
