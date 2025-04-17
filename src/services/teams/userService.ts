
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
 */
export const getOrCreatePlayerUser = async (playerData: {
  name: string;
  email?: string;
}): Promise<string> => {
  try {
    // First check if a user with this email already exists
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

    // If no existing user is found, use the RPC function to create a user
    // This will ensure the user is created properly in the auth.users table first
    console.log("Creating new player user...");
    
    // Generate a unique ID for the user
    const newUserId = crypto.randomUUID();
    
    // Create email - either use provided one or generate a placeholder
    const email = playerData.email || 
      `player_${newUserId.substring(0, 8)}@example.com`;
    
    console.log(`Creating new user with ID ${newUserId} and email ${email}`);
    
    // Use the create_player_user function which is set up as a security definer
    const { data, error } = await supabase.rpc(
      'create_player_user',
      { 
        player_name: playerData.name,
        player_email: email 
      }
    );
    
    if (error) {
      console.error("Error creating player user with RPC function:", error);
      throw error;
    }
    
    // The function returns the new user ID
    const userId = data;
    console.log("Successfully created new user with ID:", userId);
    return userId;
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
