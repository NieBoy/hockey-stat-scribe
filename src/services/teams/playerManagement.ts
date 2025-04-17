
import { supabase } from "@/lib/supabase";
import { User, Position } from "@/types";
import { mockTeams } from "@/lib/mock-data";

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
      // First attempt to use Supabase
      try {
        // Generate a temporary player ID
        const tempPlayerId = `player-${Date.now()}`;
        
        // First create minimal player in users table if not exists
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            id: tempPlayerId,
            name: playerData.name,
            email: playerData.email || `${tempPlayerId}@example.com` // Create dummy email for database constraint
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
            number: playerData.number ? parseInt(playerData.number) : null
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
      } catch (error) {
        console.error("Error creating player in Supabase without email:", error);
        
        // Fallback to mock implementation
        const tempPlayerId = `player-${Date.now()}`;
        const newPlayer = {
          id: tempPlayerId,
          name: playerData.name,
          role: ['player'],
          position: playerData.position as Position,
          number: playerData.number
        };
        
        // Find the team in mock data
        const teamIndex = mockTeams.findIndex(t => t.id === teamId);
        if (teamIndex >= 0) {
          mockTeams[teamIndex].players.push(newPlayer as User);
          console.log(`Added player to mock team: ${mockTeams[teamIndex].name}, player count: ${mockTeams[teamIndex].players.length}`);
        }
        
        return newPlayer as User;
      }
    }
    
    // If email is provided, proceed with the original implementation
    // First create or find the user
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
      // Create new user with UUID
      const { data: { user } } = await supabase.auth.signUp({
        email: playerData.email,
        password: Math.random().toString(36).substring(2, 10), // Generate random password
        options: {
          data: {
            name: playerData.name,
            number: playerData.number
          }
        }
      });
      
      if (!user) throw new Error("Failed to create user");
      userId = user.id;
      
      // Create user profile
      await supabase
        .from('users')
        .insert({
          id: userId,
          name: playerData.name,
          email: playerData.email,
          number: playerData.number
        });
      
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
        number: playerData.number ? parseInt(playerData.number) : null
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
