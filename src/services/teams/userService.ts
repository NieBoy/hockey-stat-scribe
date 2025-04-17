
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
 * Uses a new approach that doesn't rely on auth.users
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

    // Generate a random user ID - this is the key change from before
    const newUserId = crypto.randomUUID();
    console.log("Generated new user ID:", newUserId);
    
    // Create a minimal user without relying on auth.users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        name: playerData.name,
        email: playerData.email || `player_${newUserId.substring(0, 8)}@example.com`
      });

    if (insertError) {
      console.error("Error inserting new user:", insertError);
      
      // If there's a foreign key constraint issue, we need to handle it differently
      if (insertError.code === '23503' && insertError.message.includes('users_id_fkey')) {
        console.log("Direct insertion failed due to foreign key constraint. Using alternate approach...");
        
        // Let's try with the authenticated user creating the record instead
        const { data: authData } = await supabase.auth.getSession();
        if (!authData.session) {
          throw new Error("Cannot create player user: No authenticated session available");
        }
        
        // Try using the RPC function as a fallback
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'create_player_user',
          { 
            player_name: playerData.name,
            player_email: playerData.email || null
          }
        );
        
        if (rpcError) {
          console.error("Error with RPC function:", rpcError);
          throw rpcError;
        }
        
        return rpcResult;
      }
      
      throw insertError;
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
