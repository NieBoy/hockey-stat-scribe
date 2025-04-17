
import { supabase } from "@/lib/supabase";
import { Team, User } from "@/types";
import { mockTeams, mockUsers } from "@/lib/mock-data";

export const createTeam = async (teamData: {
  name: string;
}): Promise<Team | null> => {
  console.log("Creating team:", teamData);

  // Make sure the team name is present
  if (!teamData.name) {
    throw new Error("Team name is required");
  }

  try {
    // First try to create in Supabase
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error creating team, falling back to mock data:", error);
        // If Supabase fails, we'll fall through to the mock implementation
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
    } catch (supabaseError) {
      console.log("Using mock implementation due to Supabase error");
      
      // Mock implementation as fallback
      // Generate a unique ID for the team
      const newTeamId = `team-${Date.now()}`;
      
      // Create a new team object
      const newTeam: Team = {
        id: newTeamId,
        name: teamData.name,
        players: [],
        coaches: [],
        parents: []
      };
      
      // Add current user as coach (for testing purposes we'll use the first mock user)
      const currentUser = mockUsers[0];
      if (currentUser) {
        newTeam.coaches.push(currentUser);
      }
      
      // Add the team to our mock teams array
      mockTeams.push(newTeam);
      
      console.log("Created mock team successfully:", newTeam);
      return newTeam;
    }
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
};
