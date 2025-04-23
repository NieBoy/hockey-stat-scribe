
import { supabase } from "@/lib/supabase";
import { Team, User } from "@/types";

export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    // Fetch team data
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        id, 
        name,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!team) return null;
    
    // Fetch team members for this team
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        name,
        email,
        position,
        line_number,
        role
      `)
      .eq('team_id', id);
      
    if (membersError) throw membersError;
    
    // Group members by role
    const players = teamMembers
      .filter(member => member.role === 'player')
      .map(player => ({
        id: player.id,
        name: player.name || 'Unknown Player',
        position: player.position,
        lineNumber: player.line_number,
        email: player.email
      }));
    
    const coaches = teamMembers
      .filter(member => member.role === 'coach')
      .map(coach => ({
        id: coach.id,
        name: coach.name || 'Unknown Coach',
        email: coach.email
      }));
      
    const fullTeam: Team = {
      ...team,
      players,
      coaches
    };
    
    return fullTeam;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
};
