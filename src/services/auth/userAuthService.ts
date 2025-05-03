
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";
import { getUserProfile } from "./userProfileService";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get the current user from Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    // Get complete user profile using helper function
    const user = await getUserProfile(authUser.id);
    console.log("Returning user profile:", user?.id, "with roles:", user?.role);
    
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Ensure email is lowercase for consistent auth handling
    const normalizedEmail = email.toLowerCase();
    console.log("Signing in with normalized email:", normalizedEmail);
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("Sign in error:", error.message);
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      return { user: null, error: 'Failed to sign in' };
    }
    
    // Get complete user profile
    const user = await getCurrentUser();
    if (!user) {
      console.error("Could not retrieve user profile after sign in");
      return { user: null, error: 'User profile not found' };
    }
    
    console.log("User signed in successfully:", user.id);
    return { user, error: null };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { user: null, error: error?.message || 'An unexpected error occurred' };
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Ensure email is lowercase for consistent auth handling
    const normalizedEmail = email.toLowerCase();
    console.log("Attempting to sign up user:", normalizedEmail);
    
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      console.error("Sign up error:", error.message);
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Failed to create account' };
    }
    
    console.log("User created in auth:", data.user.id);
    
    // Create user profile and assign default role
    const profileSuccess = await createUserProfile(data.user.id, normalizedEmail, name);
    
    return { success: profileSuccess, error: null };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// Helper function for creating user profile during signup
async function createUserProfile(userId: string, email: string, name: string): Promise<boolean> {
  // Create user profile in the users table with some retry logic
  let profileCreated = false;
  let attempts = 0;
  
  while (!profileCreated && attempts < 3) {
    attempts++;
    try {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          name
        });
        
      if (profileError) {
        console.error(`Profile creation attempt ${attempts} failed:`, profileError);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        profileCreated = true;
        console.log("User profile created successfully");
      }
    } catch (e) {
      console.error(`Profile creation attempt ${attempts} exception:`, e);
    }
  }
  
  if (!profileCreated) {
    console.error("Could not create user profile after multiple attempts");
    return false;
  }
  
  // Assign default role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'player'
    });
    
  if (roleError) {
    console.error("Error assigning role:", roleError);
    return false;
  } else {
    console.log("Default role assigned successfully");
    return true;
  }
}
