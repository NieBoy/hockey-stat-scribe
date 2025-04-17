
import { supabase } from "@/lib/supabase";
import { Team, User, Position, UserRole } from "@/types";

export const getTeams = async (): Promise<Team[]> => {
  console.log("Fetching teams...");
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id, 
        name
      `);

    if (teamsError) {
      console.error("Error fetching teams from Supabase:", teamsError);
      throw teamsError;
    }
    
    console.log("Teams data from DB:", teamsData);
    
    // Need to fetch players and coaches separately
    const teams: Team[] = [];
    
    for (const team of teamsData || []) {
      // Get all team members with their user details if they exist
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          position,
          line_number,
          name,
          email,
          users:user_id (
            id, 
            name, 
            email
          )
        `)
        .eq('team_id', team.id);
        
      if (membersError) {
        console.error(`Error fetching members for team ${team.id}:`, membersError);
        continue; // Skip to next team if there's an error
      }
      
      console.log(`Team ${team.name} has ${teamMembers?.length || 0} members:`, teamMembers);
      
      // Filter members by role
      const players = (teamMembers || [])
        .filter(member => member.role === 'player')
        .map(p => ({
          id: p.id, // Use the team_member id directly
          name: p.name || p.users?.name || 'Unknown Player',
          email: p.email || p.users?.email,
          role: ['player'] as UserRole[],
          position: p.position as Position,
          lineNumber: p.line_number,
          number: p.line_number ? String(p.line_number) : undefined
        }));
      
      const coaches = (teamMembers || [])
        .filter(member => member.role === 'coach')
        .map(c => ({
          id: c.id, // Use the team_member id directly
          name: c.name || c.users?.name || 'Unknown Coach',
          email: c.email || c.users?.email,
          role: ['coach'] as UserRole[]
        }));
        
      const parents = (teamMembers || [])
        .filter(member => member.role === 'parent')
        .map(p => ({
          id: p.id, // Use the team_member id directly
          name: p.name || p.users?.name || 'Unknown Parent',
          email: p.email || p.users?.email,
          role: ['parent'] as UserRole[]
        }));
      
      teams.push({
        id: team.id,
        name: team.name,
        players,
        coaches,
        parents
      });
    }
    
    console.log("Processed teams with members:", teams);
    return teams;
  } catch (error) {
    console.error("Error in getTeams:", error);
    throw error;
  }
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id, 
        name
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching team ${id}:`, error);
      throw error;
    }
    
    // Get all team members with their user details if they exist
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        position,
        line_number,
        name,
        email,
        users:user_id (
          id, 
          name, 
          email
        )
      `)
      .eq('team_id', id);
      
    if (membersError) {
      console.error(`Error fetching members for team ${id}:`, membersError);
      throw membersError;
    }
    
    console.log(`Team ${data.name} has ${teamMembers?.length || 0} members`);
    
    // Make sure we have an array to work with, even if empty
    const members = teamMembers || [];
    
    // Filter members by role
    const players = members
      .filter(member => member.role === 'player')
      .map(p => ({
        id: p.id, // Use the team_member id directly
        name: p.name || p.users?.name || 'Unknown Player',
        email: p.email || p.users?.email,
        role: ['player'] as UserRole[],
        position: p.position as Position,
        lineNumber: p.line_number,
        number: p.line_number ? String(p.line_number) : undefined
      }));
    
    const coaches = members
      .filter(member => member.role === 'coach')
      .map(c => ({
        id: c.id, // Use the team_member id directly
        name: c.name || c.users?.name || 'Unknown Coach',
        email: c.email || c.users?.email,
        role: ['coach'] as UserRole[]
      }));
      
    const parents = members
      .filter(member => member.role === 'parent')
      .map(p => ({
        id: p.id, // Use the team_member id directly
        name: p.name || p.users?.name || 'Unknown Parent',
        email: p.email || p.users?.email,
        role: ['parent'] as UserRole[]
      }));
    
    return {
      id: data.id,
      name: data.name,
      players,
      coaches,
      parents
    };
  } catch (error) {
    console.error(`Error in getTeamById for team ${id}:`, error);
    throw error;
  }
};
