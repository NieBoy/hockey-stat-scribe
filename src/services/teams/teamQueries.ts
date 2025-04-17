import { supabase } from "@/lib/supabase";
import { Team, User, Position, UserRole } from "@/types";
import { mockTeams } from "@/lib/mock-data";

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
      console.log("Falling back to mock data");
      return mockTeams;
    }
    
    console.log("Teams data from DB:", teamsData);
    
    // Need to fetch players and coaches separately
    const teams: Team[] = [];
    
    for (const team of teamsData || []) {
      // Get all team members
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          position,
          line_number,
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
          id: p.users?.id || p.user_id,
          name: p.users?.name || 'Unknown Player',
          email: p.users?.email,
          role: ['player'] as UserRole[],
          position: p.position as Position,
          lineNumber: p.line_number,
          number: p.position !== null ? String(p.line_number || '') : undefined // Use line_number as a fallback
        }));
      
      const coaches = (teamMembers || [])
        .filter(member => member.role === 'coach')
        .map(c => ({
          id: c.users?.id || c.user_id,
          name: c.users?.name || 'Unknown Coach',
          email: c.users?.email,
          role: ['coach'] as UserRole[]
        }));
        
      const parents = (teamMembers || [])
        .filter(member => member.role === 'parent')
        .map(p => ({
          id: p.users?.id || p.user_id,
          name: p.users?.name || 'Unknown Parent',
          email: p.users?.email,
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
    return mockTeams; // Fallback to mock data
  }
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  try {
    // Check if the ID appears to be a mock ID (from mock data)
    const isMockId = id.startsWith('team-');
    
    if (isMockId) {
      console.log(`ID ${id} appears to be a mock ID, using mock data`);
      const mockTeam = mockTeams.find(t => t.id === id);
      return mockTeam || null;
    }
    
    // Otherwise try to fetch from Supabase
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
      
      // Fall back to mock data if Supabase fails
      const mockTeam = mockTeams.find(t => t.id === id);
      return mockTeam || null;
    }
    
    // Get all team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        position,
        line_number,
        users:user_id (
          id, 
          name, 
          email
        )
      `)
      .eq('team_id', id);
      
    if (membersError) {
      console.error(`Error fetching members for team ${id}:`, membersError);
      
      // Fall back to mock data if Supabase fails for team members
      const mockTeam = mockTeams.find(t => t.id === id);
      return mockTeam || null;
    }
    
    // Make sure we have an array to work with, even if empty
    const members = teamMembers || [];
    
    // Filter members by role
    const players = members
      .filter(member => member.role === 'player')
      .map(p => ({
        id: p.users?.id || p.user_id,
        name: p.users?.name || 'Unknown Player',
        email: p.users?.email,
        role: ['player'] as UserRole[],
        position: p.position as Position,
        lineNumber: p.line_number,
        number: p.position !== null ? String(p.line_number || '') : undefined
      }));
    
    const coaches = members
      .filter(member => member.role === 'coach')
      .map(c => ({
        id: c.users?.id || c.user_id,
        name: c.users?.name || 'Unknown Coach',
        email: c.users?.email,
        role: ['coach'] as UserRole[]
      }));
      
    const parents = members
      .filter(member => member.role === 'parent')
      .map(p => ({
        id: p.users?.id || p.user_id,
        name: p.users?.name || 'Unknown Parent',
        email: p.users?.email,
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
    
    // Fall back to mock data if anything fails
    const mockTeam = mockTeams.find(t => t.id === id);
    return mockTeam || null;
  }
};
