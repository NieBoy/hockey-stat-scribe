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
    
    // Create or get the user
    console.log("Creating or fetching player user with redesigned approach...");
    const userId = await getOrCreatePlayerUser(playerData);
    
    if (!userId) {
      throw new Error("Failed to create or get user ID");
    }
    
    console.log(`Received user ID ${userId}, adding as team member...`);
    
    // Add the team member - we'll simplify this flow and add error handling
    try {
      await addTeamMember(
        teamId, 
        userId, 
        'player', 
        playerData.position, 
        playerData.number ? parseInt(playerData.number, 10) : null
      );
      
      console.log(`Successfully added player ${playerData.name} to team ${teamId}`);
      
      // Fetch the user's info to return a complete user object
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();
      
      // Return a user object with the data we have
      return {
        id: userId,
        name: userData?.name || playerData.name,
        email: userData?.email || playerData.email || `player_${userId.substring(0, 8)}@example.com`,
        role: ['player'],
        position: playerData.position as Position,
        number: playerData.number
      };
    } catch (addError: any) {
      console.error("Error adding team member:", addError);
      throw new Error(`Failed to add player as team member: ${addError.message || "Unknown error"}`);
    }
  } catch (error: any) {
    console.error("Error in addPlayerToTeam:", error);
    throw new Error(`Failed to add player to team: ${error.message || "Unknown error"}`);
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
