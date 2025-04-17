
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get user data from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error || !data) return null;
    
    // Get user's roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    // Get user's teams - simple approach first
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);
      
    // Get team details separately to avoid join errors
    const teams = [];
    if (teamMembers && teamMembers.length > 0) {
      const teamIds = teamMembers.map(tm => tm.team_id);
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name, organization_id')
        .in('id', teamIds);
        
      if (teamsData) {
        for (const team of teamsData) {
          teams.push({
            id: team.id,
            name: team.name,
            organizationId: team.organization_id || '',
            players: [],
            coaches: [],
            parents: []
          });
        }
      }
    }
    
    // Build role array
    const userRoles = roles?.map(r => r.role as UserRole) || [];
    
    return {
      id: data.id,
      name: data.name || '',
      email: data.email,
      role: userRoles,
      teams,
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
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // First, create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Failed to create user' };
    }
    
    // Then create profile in users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        name: name
      });
      
    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return { success: false, error: 'Failed to create user profile' };
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
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};
