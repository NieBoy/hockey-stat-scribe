
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get user data from our users table
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      avatar_url,
      user_roles(role)
    `)
    .eq('id', user.id)
    .single();
    
  if (error || !data) return null;
  
  // Get user's teams
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      team_id,
      teams:team_id(id, name)
    `)
    .eq('user_id', data.id);
    
  // Build role array
  const roles = data.user_roles?.map(r => r.role) || [];
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: roles as any[],
    teams: teamMembers?.map(tm => ({
      id: tm.teams.id,
      name: tm.teams.name,
      organizationId: '',
      players: [],
      coaches: [],
      parents: []
    })) || [],
    isAdmin: roles.includes('admin')
  };
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
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
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error: string | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { success: false, error: error.message };
  
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
      return { success: false, error: createError.message };
    }
    
    // Give default role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: 'player'
      });
      
    return { success: true, error: null };
  }
  
  return { success: false, error: 'Failed to sign up' };
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};
