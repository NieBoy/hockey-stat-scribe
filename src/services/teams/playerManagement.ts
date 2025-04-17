
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";
import { 
  addTeamMember, 
  removeTeamMember, 
  updateTeamMemberInfo, 
  getTeamMembers as fetchTeamMembers 
} from "./teamMembershipService";
import { sendTeamInvitations as sendInvitations } from "./invitationService";

/**
 * Adds a player to a team without requiring a user account
 */
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
    
    // Validate required fields
    if (!playerData.name.trim()) {
      throw new Error("Player name is required");
    }
    
    // Add the team member directly
    console.log("Adding player directly to team members table...");
    const memberId = await addTeamMember(teamId, {
      name: playerData.name,
      email: playerData.email,
      role: 'player',
      position: playerData.position,
      lineNumber: playerData.number ? parseInt(playerData.number, 10) : null
    });
    
    console.log(`Successfully added player ${playerData.name} to team ${teamId} with member ID ${memberId}`);
    
    // Return a user object with the data we have
    return {
      id: memberId,
      name: playerData.name,
      email: playerData.email,
      role: ['player'],
      position: playerData.position as Position,
      number: playerData.number
    };
  } catch (error: any) {
    console.error("Error in addPlayerToTeam:", error);
    throw new Error(`Failed to add player to team: ${error.message || "Unknown error"}`);
  }
};

/**
 * Removes a player from a team
 */
export const removePlayerFromTeam = async (teamId: string, playerId: string): Promise<boolean> => {
  console.log(`Removing player ${playerId} from team ${teamId}`);
  
  try {
    const { data: authData } = await supabase.auth.getSession();
    const currentUserId = authData.session?.user.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to remove players from a team");
    }

    await removeTeamMember(teamId, playerId);
    
    console.log(`Successfully removed player ${playerId} from team ${teamId}`);
    return true;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
};

/**
 * Get all team members
 */
export const getTeamMembers = async (teamId: string): Promise<User[]> => {
  const teamMembers = await fetchTeamMembers(teamId);
  
  // Transform team_members data into User objects
  return teamMembers.map(member => ({
    id: member.id,
    name: member.name || 'Unnamed Player',
    email: member.email,
    role: [member.role || 'player'],
    position: member.position as Position,
    number: member.line_number ? member.line_number.toString() : undefined
  }));
};

/**
 * Update player information
 */
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
    
    // Update team member info directly
    await updateTeamMemberInfo(teamId, playerId, {
      name: playerData.name,
      email: playerData.email,
      position: playerData.position,
      number: playerData.number
    });
    
    return true;
  } catch (error) {
    console.error("Error in updatePlayerInfo:", error);
    throw error;
  }
};

/**
 * Function to send batch invitations to team members
 */
export const sendTeamInvitations = async (teamId: string, memberIds: string[]): Promise<boolean> => {
  return await sendInvitations(teamId, memberIds);
};
