
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";

/**
 * Checks if a user exists in the database
 */
export const userExists = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
  
  return !!data;
};

/**
 * Gets or creates a user for a player
 * Uses a database function to bypass RLS policies
 */
export const getOrCreatePlayerUser = async (playerData: {
  name: string;
  email?: string;
}): Promise<string> => {
  try {
    // First check if a user with this email already exists (if email is provided)
    if (playerData.email) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', playerData.email)
        .maybeSingle();
      
      if (existingUsers) {
        const userId = existingUsers.id;
        console.log(`User with email ${playerData.email} already exists with ID ${userId}`);
        return userId;
      }
    }

    // Generate a new user ID
    const newUserId = crypto.randomUUID();
    console.log("Generated new user ID:", newUserId);
    
    // Use the create_user_bypass_rls database function to create the user
    // This function has SECURITY DEFINER and bypasses RLS policies
    const { data, error } = await supabase.rpc('create_user_bypass_rls', {
      user_id: newUserId,
      user_name: playerData.name,
      user_email: playerData.email || `player_${newUserId.substring(0, 8)}@example.com`
    });
    
    if (error) {
      console.error("Error creating user via database function:", error);
      throw error;
    }
    
    console.log("Successfully created user with ID:", newUserId);
    return newUserId;
  } catch (error) {
    console.error("Error in getOrCreatePlayerUser:", error);
    throw error;
  }
};

/**
 * Updates user information
 */
export const updateUserInfo = async (
  userId: string,
  userData: {
    name?: string;
    email?: string;
  }
): Promise<boolean> => {
  try {
    if (!Object.keys(userData).length) return true;
    
    const updateUserData: any = {};
    if (userData.name) updateUserData.name = userData.name;
    if (userData.email !== undefined) updateUserData.email = userData.email;
    
    const { error: userUpdateError } = await supabase
      .from('users')
      .update(updateUserData)
      .eq('id', userId);
      
    if (userUpdateError) {
      console.error("Error updating user information:", userUpdateError);
      throw userUpdateError;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user info:", error);
    throw error;
  }
};
