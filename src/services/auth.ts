
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  try {
    // Get user data from our users table
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('id', user.id)
      .single();
      
    if (error || !data) return null;
    
    // Get user's roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.id);
      
    // Get user's teams
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select(`
        team_id,
        teams!inner (id, name)
      `)
      .eq('user_id', data.id);
      
    // Build role array
    const userRoles = roles?.map(r => r.role as UserRole) || [];
    
    return {
      id: data.id,
      name: data.name || '',
      email: data.email,
      role: userRoles,
      teams: teamMembers?.map(tm => ({
        id: tm.teams?.id || '',
        name: tm.teams?.name || '',
        organizationId: '',
        players: [],
        coaches: [],
        parents: []
      })) || [],
      isAdmin: userRoles.includes('admin')
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    
    if (data.user) {
      const currentUser = await getCurrentUser();
      return { user: currentUser, error: null };
    }
    
    return { user: null, error: 'Failed to sign in' };
  } catch (error) {
    console.error("Sign in error:", error);
    return { user: null, error: 'An unexpected error occurred' };
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Sign up error:", error);
      return false;
    }
    
    if (data.user) {
      // Create the user in our users table
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email
        });
        
      if (createError) {
        console.error("Error creating user:", createError);
        return false;
      }
      
      // Give default role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'player'
        });
        
      if (roleError) {
        console.error("Error assigning role:", roleError);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Sign up error:", error);
    return false;
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};
