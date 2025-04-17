
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";

export const createTeam = async (teamData: {
  name: string;
}): Promise<Team | null> => {
  console.log("Creating team:", teamData);

  // Make sure the team name is present
  if (!teamData.name) {
    throw new Error("Team name is required");
  }

  try {
    // Get the current authenticated user's session
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user.id;

    if (!userId) {
      throw new Error("User must be authenticated to create a team");
    }

    // Create team in Supabase
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamData.name
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
      throw error;
    }
    
    console.log("Team created successfully in Supabase:", data);
    
    // Automatically add the current user as a coach for the team
    const { error: teamMemberError } = await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: userId,
        role: 'coach'
      });
      
    if (teamMemberError) {
      console.error("Error adding coach to team:", teamMemberError);
      throw teamMemberError;
    }
    
    return {
      id: data.id,
      name: data.name,
      players: [],
      coaches: [{ id: userId, name: '', role: ['coach'] }],
      parents: []
    };
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
};
