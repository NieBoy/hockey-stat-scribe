
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";

export const addPlayerToTeam = async (
  teamId: string,
  playerData: {
    name: string;
    email?: string;
    position?: string;
    number?: string;
  }
): Promise<User | null> => {
  console.log(`Adding player ${playerData.name} to team ${teamId}`);
  
  try {
    // Get the current authenticated user's session
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData.session?.user.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to add players to a team");
    }

    // Generate a new UUID for the user
    let userId = crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`;
    
    // First check if a user with this email already exists (if email provided)
    if (playerData.email) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', playerData.email)
        .maybeSingle();
      
      if (existingUsers) {
        userId = existingUsers.id as `${string}-${string}-${string}-${string}-${string}`;
        console.log(`User with email ${playerData.email} already exists with ID ${userId}`);
      }
    }

    // Check if we need to create a new user record
    if (!playerData.email || !(await userExists(userId))) {
      // Insert directly using RPC function to bypass RLS
      const { data: newUser, error: userError } = await supabase.rpc(
        'create_user_bypass_rls',
        { 
          user_id: userId,
          user_name: playerData.name,
          user_email: playerData.email || null
        }
      );
      
      if (userError) {
        console.error("Error creating user:", userError);
        throw userError;
      }
      
      console.log("Created new user:", newUser);
    }
    
    // Now add the team member
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'player',
        position: playerData.position || null,
        line_number: playerData.number ? parseInt(playerData.number, 10) : null
      })
      .select();
      
    if (teamMemberError) {
      console.error("Error adding player to team:", teamMemberError);
      throw teamMemberError;
    }
    
    console.log(`Successfully added player ${playerData.name} to team ${teamId} in Supabase`);
    
    // Return a user object with the data we have
    return {
      id: userId,
      name: playerData.name,
      email: playerData.email,
      role: ['player'],
      position: playerData.position as Position,
      number: playerData.number
    };
  } catch (error) {
    console.error("Error in addPlayerToTeam:", error);
    throw error;
  }
};

// Helper function to check if user exists
const userExists = async (userId: string): Promise<boolean> => {
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

export const removePlayerFromTeam = async (teamId: string, playerId: string): Promise<boolean> => {
  console.log(`Removing player ${playerId} from team ${teamId}`);
  
  try {
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData.session?.user.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to remove players from a team");
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', playerId);
      
    if (error) {
      console.error("Error removing player from team:", error);
      throw error;
    }
    
    console.log(`Successfully removed player ${playerId} from team ${teamId} in Supabase`);
    return true;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
};

// Get all team members
export const getTeamMembers = async (teamId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        position,
        line_number
      `)
      .eq('team_id', teamId)
      .order('role');
      
    if (error) {
      console.error(`Error fetching team members for ${teamId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTeamMembers:", error);
    throw error;
  }
};

// Update player information
export const updatePlayerInfo = async (
  teamId: string,
  playerId: string,
  playerData: {
    name?: string;
    email?: string;
    position?: string;
    number?: string;
  }
): Promise<boolean> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData.session?.user.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to update player information");
    }
    
    // Update user information if provided
    if (playerData.name || playerData.email !== undefined) {
      const updateUserData: any = {};
      if (playerData.name) updateUserData.name = playerData.name;
      if (playerData.email !== undefined) updateUserData.email = playerData.email;
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(updateUserData)
        .eq('id', playerId);
        
      if (userUpdateError) {
        console.error("Error updating user information:", userUpdateError);
        throw userUpdateError;
      }
    }
    
    // Update team_members table
    const updateData: any = {};
    
    if (playerData.position !== undefined) {
      updateData.position = playerData.position;
    }
    
    if (playerData.number !== undefined) {
      updateData.line_number = playerData.number ? parseInt(playerData.number, 10) : null;
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('team_id', teamId)
        .eq('user_id', playerId);
        
      if (teamMemberError) {
        console.error("Error updating player in team:", teamMemberError);
        throw teamMemberError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in updatePlayerInfo:", error);
    throw error;
  }
};

// Function to send batch invitations to team members
export const sendTeamInvitations = async (teamId: string, memberIds: string[]): Promise<boolean> => {
  try {
    // Implementation for sending batch invitations would go here
    // For now, we'll just log the action
    console.log(`Sending invitations to ${memberIds.length} members of team ${teamId}`);
    
    // Fetch users to get their emails
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', memberIds);
      
    if (usersError) {
      console.error("Error fetching users for invitations:", usersError);
      throw usersError;
    }
    
    // Filter out users without emails
    const usersWithEmail = users?.filter(user => user.email) || [];
    
    if (usersWithEmail.length === 0) {
      console.log("No users with emails to invite");
      return false;
    }
    
    console.log(`Would send emails to: ${usersWithEmail.map(u => u.email).join(', ')}`);
    
    // You would typically call an API endpoint or edge function here to send the emails
    
    return true;
  } catch (error) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};
