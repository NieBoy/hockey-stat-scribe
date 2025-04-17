import { supabase } from "@/lib/supabase";
import { Team, User, Lines, UserRole, Position } from "@/types";

export const getTeams = async (): Promise<Team[]> => {
  console.log("Fetching teams...");
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id, 
      name, 
      organization_id
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
      organizationId: team.organization_id,
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
      name, 
      organization_id
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
    organizationId: data.organization_id,
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

export const createTeam = async (teamData: {
  name: string;
  organizationId: string;
}): Promise<Team | null> => {
  console.log("Creating team:", teamData);

  // Make sure the team name is present
  if (!teamData.name) {
    throw new Error("Team name is required");
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: teamData.name,
        organization_id: teamData.organizationId || 'default'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating team:", error);
      throw error;
    }
    
    console.log("Team created successfully:", data);
    
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
      organizationId: data.organization_id,
      players: [],
      coaches: [],
      parents: []
    };
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
};

export const addPlayerToTeam = async (
  teamId: string,
  playerData: {
    name: string;
    email: string;
    position?: string;
  }
): Promise<User | null> => {
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
          name: playerData.name
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
        email: playerData.email
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
      position: playerData.position
    });
    
  if (teamMemberError) throw teamMemberError;
  
  return {
    id: userId,
    name: playerData.name,
    email: playerData.email,
    role: ['player'],
    position: playerData.position as any
  };
};

export const updateTeamLineup = async (
  teamId: string, 
  lines: Lines
): Promise<boolean> => {
  // First get all players for this team
  const { data: teamPlayers } = await supabase
    .from('team_members')
    .select('user_id, position, line_number')
    .eq('team_id', teamId)
    .eq('role', 'player');
    
  // Prepare batch updates
  const updates = [];
  
  // Update forward lines
  for (const line of lines.forwards) {
    if (line.leftWing) {
      updates.push({
        team_id: teamId,
        user_id: line.leftWing.id,
        role: 'player',
        position: 'LW',
        line_number: line.lineNumber
      });
    }
    
    if (line.center) {
      updates.push({
        team_id: teamId,
        user_id: line.center.id,
        role: 'player',
        position: 'C',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightWing) {
      updates.push({
        team_id: teamId,
        user_id: line.rightWing.id,
        role: 'player',
        position: 'RW',
        line_number: line.lineNumber
      });
    }
  }
  
  // Update defense lines
  for (const line of lines.defense) {
    if (line.leftDefense) {
      updates.push({
        team_id: teamId,
        user_id: line.leftDefense.id,
        role: 'player',
        position: 'LD',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightDefense) {
      updates.push({
        team_id: teamId,
        user_id: line.rightDefense.id,
        role: 'player',
        position: 'RD',
        line_number: line.lineNumber
      });
    }
  }
  
  // Update goalies
  for (const goalie of lines.goalies) {
    updates.push({
      team_id: teamId,
      user_id: goalie.id,
      role: 'player',
      position: 'G',
      line_number: null
    });
  }
  
  // Delete existing positions/lines
  await supabase
    .from('team_members')
    .update({
      position: null,
      line_number: null
    })
    .eq('team_id', teamId)
    .eq('role', 'player');
    
  // Apply updates
  for (const update of updates) {
    await supabase
      .from('team_members')
      .update({
        position: update.position,
        line_number: update.line_number
      })
      .eq('team_id', update.team_id)
      .eq('user_id', update.user_id);
  }
  
  return true;
};
