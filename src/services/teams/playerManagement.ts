
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
    // Generate a unique player ID if no email is provided
    if (!playerData.email) {
      // Generate a UUID for the player
      const tempPlayerId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // First create minimal player in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: tempPlayerId,
          name: playerData.name,
          email: `${tempPlayerId}@example.com` // Create dummy email for database constraint
        })
        .select()
        .single();
        
      if (userError) throw userError;
      
      // Add the player to team_members table
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: tempPlayerId,
          role: 'player',
          position: playerData.position || null,
          line_number: playerData.number ? parseInt(playerData.number) : null
        });
        
      if (teamMemberError) throw teamMemberError;
      
      console.log(`Successfully added player ${playerData.name} to team ${teamId} in Supabase`);
      
      return {
        id: tempPlayerId,
        name: playerData.name,
        role: ['player'],
        position: playerData.position as Position,
        number: playerData.number
      };
    }
    
    // If email is provided, find or create the user
    const { data: existingUsers, error: findError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', playerData.email)
      .maybeSingle();
      
    let userId: string;
      
    if (existingUsers) {
      // User exists
      userId = existingUsers.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: playerData.name,
          email: playerData.email
        })
        .select()
        .single();
      
      if (createError) throw new Error(`Failed to create user: ${createError.message}`);
      if (!newUser) throw new Error("Failed to create user: No data returned");
      
      userId = newUser.id;
      
      // Assign player role to user
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'player'
        });
    }
    
    // Add player to team
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'player',
        position: playerData.position || null,
        line_number: playerData.number ? parseInt(playerData.number) : null
      });
      
    if (teamMemberError) throw teamMemberError;
    
    console.log(`Successfully added player ${playerData.name} with email to team ${teamId}`);
    
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
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', playerId);
      
    if (error) throw error;
    
    console.log(`Successfully removed player ${playerId} from team ${teamId} in Supabase`);
    return true;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
};
