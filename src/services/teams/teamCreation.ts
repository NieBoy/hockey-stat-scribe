
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
    const { data: authData } = await supabase.auth.getSession();
    if (authData.session?.user.id) {
      const userId = authData.session.user.id;
      console.log("Adding current user as coach:", userId);
      
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: userId,
          role: 'coach'
        });
        
      if (teamMemberError) {
        console.error("Error adding coach to team:", teamMemberError);
      }
    }
    
    return {
      id: data.id,
      name: data.name,
      players: [],
      coaches: [],
      parents: []
    };
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
};
