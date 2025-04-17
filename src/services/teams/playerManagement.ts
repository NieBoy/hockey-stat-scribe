
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

    // First, check if this player needs a user record
    let userId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // If we have an email, we can check if a user already exists with this email
    if (playerData.email) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', playerData.email)
        .limit(1);
      
      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`Found existing user with email ${playerData.email}: ${userId}`);
      } else {
        // Create a new user record
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: playerData.name,
            email: playerData.email
          })
          .select();
        
        if (userError) {
          console.error("Error creating user:", userError);
          // Don't throw here - we'll try to create the team member directly
        }
      }
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

// New function to get all team members
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

// New function to update player information
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
    
    // Update team_members table
    const updateData: any = {};
    
    if (playerData.position) {
      updateData.position = playerData.position;
    }
    
    if (playerData.number) {
      updateData.line_number = parseInt(playerData.number, 10);
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
    
    // You would typically call an API endpoint or edge function here to send the emails
    
    return true;
  } catch (error) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};
