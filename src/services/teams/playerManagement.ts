
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";
import { getOrCreatePlayerUser, updateUserInfo } from "./userService";
import { addTeamMember, removeTeamMember, updateTeamMemberInfo, getTeamMembers as fetchTeamMembers } from "./teamMembershipService";
import { sendTeamInvitations as sendInvitations } from "./invitationService";

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
    
    // Get or create user
    const userId = await getOrCreatePlayerUser(playerData);
    
    // Verify that the user exists in the database before proceeding
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError || !userExists) {
      console.error("Failed to verify user exists:", checkError);
      throw new Error(`Could not verify user exists with ID ${userId}`);
    }
    
    // Add the team member
    await addTeamMember(
      teamId, 
      userId, 
      'player', 
      playerData.position, 
      playerData.number ? parseInt(playerData.number, 10) : null
    );
    
    console.log(`Successfully added player ${playerData.name} to team ${teamId}`);
    
    // Return a user object with the data we have
    return {
      id: userId,
      name: playerData.name,
      email: playerData.email || `player_${userId.substring(0, 8)}@example.com`,
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

    await removeTeamMember(teamId, playerId);
    
    console.log(`Successfully removed player ${playerId} from team ${teamId} in Supabase`);
    return true;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
};

// Get all team members
export const getTeamMembers = async (teamId: string): Promise<any[]> => {
  return await fetchTeamMembers(teamId);
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
      await updateUserInfo(playerId, {
        name: playerData.name,
        email: playerData.email
      });
    }
    
    // Update team_members table
    await updateTeamMemberInfo(teamId, playerId, {
      position: playerData.position,
      number: playerData.number
    });
    
    return true;
  } catch (error) {
    console.error("Error in updatePlayerInfo:", error);
    throw error;
  }
};

// Function to send batch invitations to team members
export const sendTeamInvitations = async (teamId: string, memberIds: string[]): Promise<boolean> => {
  return await sendInvitations(teamId, memberIds);
};
