import { supabase } from "@/lib/supabase";
import { Game, GameFormState, GameStat, StatTracker, UserRole, StatType } from "@/types";

export const getGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        home_team_id,
        away_team_id,
        date,
        location,
        periods,
        current_period,
        is_active
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    
    const games: Game[] = [];
    
    for (const game of data || []) {
      // Get home team
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id, name, organization_id')
        .eq('id', game.home_team_id)
        .single();
        
      // Get away team
      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id, name, organization_id')
        .eq('id', game.away_team_id)
        .single();
        
      // Get stat trackers
      const { data: statTrackers } = await supabase
        .from('stat_trackers')
        .select(`
          id,
          game_id,
          user_id,
          stat_type
        `)
        .eq('game_id', game.id);
        
      // For each stat tracker, get the user details separately
      const formattedTrackers: StatTracker[] = [];
      
      if (statTrackers) {
        for (const tracker of statTrackers) {
          // Get user details
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', tracker.user_id)
            .single();
            
          if (userData) {
            // Find existing tracker or create new one
            let existingTracker = formattedTrackers.find(t => t.user.id === userData.id);
            
            if (existingTracker) {
              existingTracker.statTypes.push(tracker.stat_type as StatType);
            } else {
              formattedTrackers.push({
                user: {
                  id: userData.id,
                  name: userData.name || '',
                  email: userData.email,
                  role: ['player'] as UserRole[]
                },
                statTypes: [tracker.stat_type as StatType]
              });
            }
          }
        }
      }
      
      // Get game stats
      const { data: gameStats } = await supabase
        .from('game_stats')
        .select('*')
        .eq('game_id', game.id);
      
      games.push({
        id: game.id,
        date: new Date(game.date),
        homeTeam: {
          id: homeTeam?.id || game.home_team_id,
          name: homeTeam?.name || 'Unknown Team',
          organizationId: homeTeam?.organization_id || '',
          players: [],
          coaches: [],
          parents: []
        },
        awayTeam: {
          id: awayTeam?.id || game.away_team_id,
          name: awayTeam?.name || 'Unknown Team',
          organizationId: awayTeam?.organization_id || '',
          players: [],
          coaches: [],
          parents: []
        },
        location: game.location,
        statTrackers: formattedTrackers,
        periods: game.periods,
        currentPeriod: game.current_period,
        isActive: game.is_active,
        stats: gameStats as any[] || []
      });
    }
    
    return games;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const getGameById = async (id: string): Promise<Game | null> => {
  try {
    const { data: game, error } = await supabase
      .from('games')
      .select(`
        id,
        home_team_id,
        away_team_id,
        date,
        location,
        periods,
        current_period,
        is_active
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    
    // Get home team with players
    const homeTeam = await getGameTeam(game.home_team_id);
    
    // Get away team with players
    const awayTeam = await getGameTeam(game.away_team_id);
    
    // Get stat trackers
    const { data: statTrackers } = await supabase
      .from('stat_trackers')
      .select(`
        id,
        game_id,
        user_id,
        stat_type
      `)
      .eq('game_id', game.id);
      
    // For each stat tracker, get the user details separately
    const formattedTrackers: StatTracker[] = [];
    
    if (statTrackers) {
      for (const tracker of statTrackers) {
        // Get user details
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', tracker.user_id)
          .single();
          
        if (userData) {
          // Find existing tracker or create new one
          let existingTracker = formattedTrackers.find(t => t.user.id === userData.id);
          
          if (existingTracker) {
            existingTracker.statTypes.push(tracker.stat_type as StatType);
          } else {
            formattedTrackers.push({
              user: {
                id: userData.id,
                name: userData.name || '',
                email: userData.email,
                role: ['player'] as UserRole[]
              },
              statTypes: [tracker.stat_type as StatType]
            });
          }
        }
      }
    }
    
    // Get game stats
    const { data: gameStats } = await supabase
      .from('game_stats')
      .select('*')
      .eq('game_id', game.id);
    
    return {
      id: game.id,
      date: new Date(game.date),
      homeTeam,
      awayTeam,
      location: game.location,
      statTrackers: formattedTrackers,
      periods: game.periods,
      currentPeriod: game.current_period,
      isActive: game.is_active,
      stats: gameStats as any[] || []
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
};

const getGameTeam = async (teamId: string) => {
  try {
    const { data: team } = await supabase
      .from('teams')
      .select('id, name, organization_id')
      .eq('id', teamId)
      .single();
      
    // Get players
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        role,
        position,
        line_number,
        users (id, name, email)
      `)
      .eq('team_id', teamId);
      
    const players = members?.filter(m => m.role === 'player' && m.users).map(p => ({
      id: p.users.id,
      name: p.users.name,
      email: p.users.email,
      role: ['player'] as UserRole[],
      position: p.position as any,
      lineNumber: p.line_number
    })) || [];
    
    const coaches = members?.filter(m => m.role === 'coach' && m.users).map(c => ({
      id: c.users.id,
      name: c.users.name,
      email: c.users.email,
      role: ['coach'] as UserRole[]
    })) || [];
    
    return {
      id: team.id,
      name: team.name,
      organizationId: team.organization_id,
      players,
      coaches,
      parents: []
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    // Return minimal team object to prevent null reference errors
    return {
      id: teamId,
      name: "Unknown Team",
      organizationId: "",
      players: [],
      coaches: [],
      parents: []
    };
  }
};

export const createGame = async (gameFormData: GameFormState): Promise<Game | null> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert({
        home_team_id: gameFormData.homeTeam,
        away_team_id: gameFormData.awayTeam,
        date: gameFormData.date.toISOString(),
        location: gameFormData.location,
        periods: gameFormData.periods,
        current_period: 0,
        is_active: false
      })
      .select()
      .single();

    if (error) throw error;
    
    return await getGameById(data.id);
  } catch (error) {
    console.error("Error creating game:", error);
    return null;
  }
};

export const updateGameStatus = async (
  gameId: string, 
  isActive: boolean, 
  currentPeriod: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('games')
      .update({
        is_active: isActive,
        current_period: currentPeriod
      })
      .eq('id', gameId);
      
    return !error;
  } catch (error) {
    console.error("Error updating game status:", error);
    return false;
  }
};

export const assignStatTracker = async (
  gameId: string,
  userId: string,
  statTypes: string[]
): Promise<boolean> => {
  try {
    // Remove existing assignments first
    await supabase
      .from('stat_trackers')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);
      
    // Create new assignments
    const inserts = statTypes.map(statType => ({
      game_id: gameId,
      user_id: userId,
      stat_type: statType
    }));
    
    const { error } = await supabase
      .from('stat_trackers')
      .insert(inserts);
      
    return !error;
  } catch (error) {
    console.error("Error assigning stat tracker:", error);
    return false;
  }
};

export const recordGameStats = async (
  gameStats: GameStat[]
): Promise<boolean> => {
  try {
    const formattedStats = gameStats.map(stat => ({
      id: stat.id.startsWith('temp-') ? undefined : stat.id,
      game_id: stat.gameId,
      player_id: stat.playerId,
      stat_type: stat.statType,
      period: stat.period,
      timestamp: stat.timestamp.toISOString(),
      value: stat.value,
      details: stat.details
    }));
    
    const { error } = await supabase
      .from('game_stats')
      .insert(formattedStats);
      
    if (error) throw error;
    
    // Update the player_stats table with aggregated stats
    for (const stat of gameStats) {
      try {
        // Check if player stat already exists
        const { data: existingStat } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', stat.playerId)
          .eq('stat_type', stat.statType)
          .maybeSingle();
          
        if (existingStat) {
          // Update existing stat
          await supabase
            .from('player_stats')
            .update({
              value: existingStat.value + stat.value,
              games_played: existingStat.games_played
            })
            .eq('id', existingStat.id);
        } else {
          // Create new stat
          await supabase
            .from('player_stats')
            .insert({
              player_id: stat.playerId,
              stat_type: stat.statType,
              value: stat.value,
              games_played: 1
            });
        }
      } catch (statError) {
        console.error("Error updating player stats:", statError);
      }
    }
      
    return true;
  } catch (error) {
    console.error("Error recording game stats:", error);
    return false;
  }
};
