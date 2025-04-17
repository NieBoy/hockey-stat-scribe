
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get the current user from Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;
    
    // Get user profile data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
      
    if (userError) {
      console.error("Error fetching user profile:", userError);
      return null;
    }
    
    // If user doesn't exist in the users table yet, create a minimal profile
    let userProfile = userData;
    if (!userProfile) {
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User'
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating user profile:", createError);
        return null;
      }
      
      userProfile = newUserData;
    }
    
    // Get user roles from the user_roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id);
      
    // If no roles exist yet, create default 'player' role
    let roles: UserRole[] = [];
    if (rolesError || !rolesData || rolesData.length === 0) {
      // Assign default role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role: 'player'
        });
      
      if (!roleError) {
        roles = ['player'] as UserRole[];
      }
    } else {
      // Extract roles into an array
      roles = rolesData.map(r => r.role as UserRole);
    }
    
    // Fetch teams the user belongs to
    const { data: teamMembersData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', authUser.id);
      
    // Get details for each team
    const teams = [];
    if (teamMembersData && teamMembersData.length > 0) {
      const teamIds = teamMembersData.map(tm => tm.team_id);
      
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
    
    // Construct and return the user object
    return {
      id: userProfile.id,
      name: userProfile.name || '',
      email: userProfile.email,
      role: roles,
      teams,
      isAdmin: roles.includes('admin')
    };
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
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      return { user: null, error: 'Failed to sign in' };
    }
    
    // Get complete user profile
    const user = await getCurrentUser();
    return { user, error: null };
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
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'Failed to create account' };
    }
    
    // Create user profile in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name
      });
      
    if (profileError) {
      console.error("Error creating user profile:", profileError);
    }
    
    // Assign default role
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
