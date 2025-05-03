
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
      console.log("Creating new user profile for:", authUser.id);
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
      
    // If no roles exist yet, need to determine appropriate role
    let roles: UserRole[] = [];
    if (rolesError || !rolesData || rolesData.length === 0) {
      console.log("No roles found for user, determining appropriate role");
      
      // Check if user is associated with any teams or organizations
      const { data: teamMemberships, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', authUser.id);
        
      if (teamError) {
        console.error("Error checking team memberships:", teamError);
      }
      
      // If user has no team associations, make them an admin
      if (!teamMemberships || teamMemberships.length === 0) {
        console.log("No team associations found, assigning admin role to:", authUser.id);
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.id,
            role: 'admin'
          });
        
        if (!roleError) {
          roles = ['admin'] as UserRole[];
        } else {
          console.error("Error assigning admin role:", roleError);
          // Fallback to player role if admin assignment fails
          const { error: fallbackRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authUser.id,
              role: 'player'
            });
          
          if (!fallbackRoleError) {
            roles = ['player'] as UserRole[];
          } else {
            console.error("Error assigning fallback role:", fallbackRoleError);
          }
        }
      } else {
        // User has team associations, use existing role from team membership
        // Default to player if we can't determine
        console.log("User has team associations, using role from membership");
        let assignedRole = 'player';
        
        if (teamMemberships.some(tm => tm.role === 'coach')) {
          assignedRole = 'coach';
        }
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.id,
            role: assignedRole
          });
        
        if (!roleError) {
          roles = [assignedRole] as UserRole[];
        } else {
          console.error("Error assigning role from team membership:", roleError);
        }
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
    
    console.log("Returning user profile:", userProfile?.id, "with roles:", roles);
    
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
    
    // Create user profile in the users table with some retry logic
    let profileCreated = false;
    let attempts = 0;
    
    while (!profileCreated && attempts < 3) {
      attempts++;
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
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
    } else {
      console.log("Default role assigned successfully");
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error?.message || 'An unexpected error occurred' };
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

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
