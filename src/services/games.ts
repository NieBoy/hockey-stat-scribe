import { Game, User, Team, GameStat, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

export const getGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(
          id,
          name
        ),
        away_team:teams!away_team_id(
          id,
          name
        )
      `);

    if (error) throw error;
    
    // Get team members in a separate query
    const gameIds = data?.map(game => game.id) || [];
    
    // Transform the database response to match our Game type
    const transformedData = await Promise.all((data || []).map(async game => {
      // Get team members for home team
      const { data: homeTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', game.home_team.id);
      
      // Get team members for away team
      const { data: awayTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', game.away_team.id);
      
      // Map team members to User type, converting string role to UserRole array
      const mapTeamMemberToUser = (member: any): User => ({
        id: member.user_id || member.id,
        name: member.name || '',
        email: member.email,
        role: [member.role as UserRole], // Convert string to array of UserRole
        position: member.position as any, // Cast to Position type
        lineNumber: member.line_number,
        number: member.jersey_number
      });
      
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: game.home_team.id,
        name: game.home_team.name,
        players: (homeTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (homeTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (homeTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: game.away_team.id,
        name: game.away_team.name,
        players: (awayTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (awayTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (awayTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      return {
        id: game.id,
        date: new Date(game.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: game.location,
        statTrackers: [], // Default empty array
        periods: game.periods,
        currentPeriod: game.current_period,
        isActive: game.is_active,
        stats: [] // Default empty array
      };
    }));
    
    return transformedData;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const getGameById = async (id: string): Promise<Game | null> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(
          id,
          name
        ),
        away_team:teams!away_team_id(
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (data) {
      // Get team members for home team
      const { data: homeTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', data.home_team.id);
      
      // Get team members for away team
      const { data: awayTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', data.away_team.id);
      
      // Map team members to User type, converting string role to UserRole array
      const mapTeamMemberToUser = (member: any): User => ({
        id: member.user_id || member.id,
        name: member.name || '',
        email: member.email,
        role: [member.role as UserRole], // Convert string to array of UserRole
        position: member.position as any, // Cast to Position type
        lineNumber: member.line_number,
        number: member.jersey_number
      });
      
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: data.home_team.id,
        name: data.home_team.name,
        players: (homeTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (homeTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (homeTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: data.away_team.id,
        name: data.away_team.name,
        players: (awayTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (awayTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (awayTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      const game: Game = {
        id: data.id,
        date: new Date(data.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: data.location,
        statTrackers: [], // Default empty array
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: [] // Default empty array
      };
      return game;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
};

export const createGame = async (gameData: {
  date: Date;
  location: string;
  homeTeam: string;
  awayTeam: string;
  periods: number;
}): Promise<Game | null> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: gameData.date.toISOString(),
        location: gameData.location,
        home_team_id: gameData.homeTeam,
        away_team_id: gameData.awayTeam,
        periods: gameData.periods,
        current_period: 0,
        is_active: false
      })
      .select(`
        *,
        home_team:teams!home_team_id(
          id,
          name
        ),
        away_team:teams!away_team_id(
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error("Error creating game:", error);
      throw error;
    }

    if (data) {
      // Get team members for home team
      const { data: homeTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', data.home_team.id);
      
      // Get team members for away team
      const { data: awayTeamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', data.away_team.id);
      
      // Map team members to User type, converting string role to UserRole array
      const mapTeamMemberToUser = (member: any): User => ({
        id: member.user_id || member.id,
        name: member.name || '',
        email: member.email,
        role: [member.role as UserRole], // Convert string to array of UserRole
        position: member.position as any, // Cast to Position type
        lineNumber: member.line_number,
        number: member.jersey_number
      });
      
      // Transform the home team data to match our Team type
      const homeTeam: Team = {
        id: data.home_team.id,
        name: data.home_team.name,
        players: (homeTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (homeTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (homeTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      // Transform the away team data to match our Team type
      const awayTeam: Team = {
        id: data.away_team.id,
        name: data.away_team.name,
        players: (awayTeamMembers || [])
          .filter(m => m.role === 'player')
          .map(mapTeamMemberToUser),
        coaches: (awayTeamMembers || [])
          .filter(m => m.role === 'coach')
          .map(mapTeamMemberToUser),
        parents: (awayTeamMembers || [])
          .filter(m => m.role === 'parent')
          .map(mapTeamMemberToUser)
      };
      
      const game: Game = {
        id: data.id,
        date: new Date(data.date),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        location: data.location,
        statTrackers: [], // Default empty array
        periods: data.periods,
        currentPeriod: data.current_period,
        isActive: data.is_active,
        stats: [] // Default empty array
      };
      return game;
    }
    
    return null;
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

export const startGame = async (id: string): Promise<Game | null> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Starting game:", id);
    return null;
  } catch (error) {
    console.error("Error starting game:", error);
    return null;
  }
};

export const endGame = async (id: string): Promise<Game | null> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Ending game:", id);
    return null;
  } catch (error) {
    console.error("Error ending game:", error);
    return null;
  }
};

export const getGamesByTeam = async (teamId: string): Promise<Game[]> => {
  try {
    // This will need to be implemented with actual Supabase calls
    console.log("Getting games for team:", teamId);
    return [];
  } catch (error) {
    console.error("Error fetching team games:", error);
    return [];
  }
};
