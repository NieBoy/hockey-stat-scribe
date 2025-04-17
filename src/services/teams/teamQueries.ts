
import { supabase } from "@/lib/supabase";
import { Team, User, Position, UserRole } from "@/types";
import { mockTeams } from "@/lib/mock-data";

export const getTeams = async (): Promise<Team[]> => {
  console.log("Fetching teams...");
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, 
      name
    `);

  if (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
  
  console.log("Teams data from DB:", data);
  
  // Need to fetch players and coaches separately
  const teams: Team[] = [];
  
  for (const team of data || []) {
    const playersResult = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        position,
        line_number,
        users:user_id(id, name, email)
      `)
      .eq('team_id', team.id)
      .eq('role', 'player');
      
    const coachesResult = await supabase
      .from('team_members')
      .select(`
        user_id,
        users:user_id(id, name, email)
      `)
      .eq('team_id', team.id)
      .eq('role', 'coach');
      
    const parentsResult = await supabase
      .from('team_members')
      .select(`
        user_id,
        users:user_id(id, name, email)
      `)
      .eq('team_id', team.id)
      .eq('role', 'parent');
    
    const players = playersResult.data?.filter(p => p.role === 'player').map(p => ({
      id: p.users?.id || p.user_id,
      name: p.users?.name || '',
      email: p.users?.email || '',
      role: ['player'] as UserRole[],
      position: p.position as Position,
      lineNumber: p.line_number
    })) || [];
    
    const coaches = coachesResult.data?.map(c => ({
      id: c.users?.id || c.user_id,
      name: c.users?.name || '',
      email: c.users?.email || '',
      role: ['coach'] as UserRole[]
    })) || [];
    
    const parents = parentsResult.data?.map(p => ({
      id: p.users?.id || p.user_id,
      name: p.users?.name || '',
      email: p.users?.email || '',
      role: ['parent'] as UserRole[]
    })) || [];
    
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
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, 
      name
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  
  // Fetch players
  const playersResult = await supabase
    .from('team_members')
    .select(`
      user_id,
      role,
      position,
      line_number,
      users:user_id(id, name, email)
    `)
    .eq('team_id', id)
    .eq('role', 'player');
    
  // Fetch coaches
  const coachesResult = await supabase
    .from('team_members')
    .select(`
      user_id,
      users:user_id(id, name, email)
    `)
    .eq('team_id', id)
    .eq('role', 'coach');
    
  // Fetch parents
  const parentsResult = await supabase
    .from('team_members')
    .select(`
      user_id,
      users:user_id(id, name, email)
    `)
    .eq('team_id', id)
    .eq('role', 'parent');
  
  return {
    id: data.id,
    name: data.name,
    players: playersResult.data?.map(p => ({
      id: p.users?.id || p.user_id,
      name: p.users?.name || '',
      email: p.users?.email || '',
      role: ['player'] as UserRole[],
      position: p.position as Position,
      lineNumber: p.line_number
    })) || [],
    coaches: coachesResult.data?.map(c => ({
      id: c.users?.id || c.user_id,
      name: c.users?.name || '',
      email: c.users?.email || '',
      role: ['coach'] as UserRole[]
    })) || [],
    parents: parentsResult.data?.map(p => ({
      id: p.users?.id || p.user_id,
      name: p.users?.name || '',
      email: p.users?.email || '',
      role: ['parent'] as UserRole[]
    })) || []
  };
};
