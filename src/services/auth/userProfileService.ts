
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

// Get complete user profile including roles and teams
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    // Get user profile data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      console.error("Error fetching user profile:", userError);
      return null;
    }
    
    // If user doesn't exist in the users table yet, create a minimal profile
    let userProfile = userData;
    if (!userProfile) {
      console.log("Creating new user profile for:", userId);
      
      // Get auth user data to fill in profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;
      
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
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
    
    // Get user roles and teams
    const roles = await getUserRoles(userId);
    const teams = await getUserTeams(userId);
    
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
    console.error("Error in getUserProfile:", error);
    return null;
  }
};

// Get user roles, creating a default if none exist
async function getUserRoles(userId: string): Promise<UserRole[]> {
  // Get user roles from the user_roles table
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
    
  // If no roles exist yet, need to determine appropriate role
  let roles: UserRole[] = [];
  
  if (rolesError || !rolesData || rolesData.length === 0) {
    console.log("No roles found for user, determining appropriate role");
    
    // Check if user is associated with any teams or organizations
    const { data: teamMemberships, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId);
      
    if (teamError) {
      console.error("Error checking team memberships:", teamError);
    }
    
    // If user has no team associations, make them an admin
    if (!teamMemberships || teamMemberships.length === 0) {
      console.log("No team associations found, assigning admin role to:", userId);
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
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
            user_id: userId,
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
          user_id: userId,
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
  
  return roles;
}

// Get teams the user belongs to
async function getUserTeams(userId: string) {
  // Fetch teams the user belongs to
  const { data: teamMembersData } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);
    
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
  
  return teams;
}
