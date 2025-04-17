
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

    // Generate a unique player ID
    const tempPlayerId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Add the player directly to team_members table without creating a user record
    // This bypasses the RLS policy issue on the users table
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: tempPlayerId, // Use the generated ID
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
      id: tempPlayerId,
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
