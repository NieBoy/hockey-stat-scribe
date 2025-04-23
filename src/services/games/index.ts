
import { supabase } from "@/lib/supabase";
import { transform, transformSingle } from "./teamTransforms";
import { Game } from "@/types";

export async function getGames(): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        date,
        location,
        periods,
        current_period,
        is_active,
        opponent_name,
        home_team_id (
          id,
          name
        ),
        away_team_id (
          id,
          name
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    
    // Transform the data
    return transform(data || []);
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export async function getGameById(id: string): Promise<Game | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        id,
        date,
        location,
        periods,
        current_period,
        is_active,
        opponent_name,
        home_team_id (
          id,
          name
        ),
        away_team_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching game:", error);
      return null;
    }
    
    // First get the basic game object with team references
    const game = transformSingle(data);
    
    if (!game) return null;
    
    // Fetch players for home team
    if (game.homeTeam) {
      const { data: homePlayers, error: homeError } = await supabase
        .from('team_members')
        .select('id, name, position')
        .eq('team_id', game.homeTeam.id)
        .eq('role', 'player');
      
      if (homeError) {
        console.error("Error fetching home players:", homeError);
      } else {
        game.homeTeam.players = homePlayers || [];
      }
    }
    
    // Fetch players for away team if it exists
    if (game.awayTeam) {
      const { data: awayPlayers, error: awayError } = await supabase
        .from('team_members')
        .select('id, name, position')
        .eq('team_id', game.awayTeam.id)
        .eq('role', 'player');
      
      if (awayError) {
        console.error("Error fetching away players:", awayError);
      } else {
        game.awayTeam.players = awayPlayers || [];
      }
    } else if (game.opponent_name) {
      // For opponent games, ensure we still have a valid structure but mark as external
      game.awayTeam = null;
    }
    
    return game;
  } catch (error) {
    console.error("Error in getGameById:", error);
    return null;
  }
}

export async function createGame(gameData: any): Promise<{ success: boolean; id?: string; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select();

    if (error) {
      return { 
        success: false, 
        error 
      };
    }

    return { 
      success: true, 
      id: data?.[0]?.id 
    };
  } catch (error) {
    return { 
      success: false, 
      error 
    };
  }
}

export async function updateGame(id: string, gameData: any): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id);

    if (error) {
      return { 
        success: false, 
        error 
      };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error 
    };
  }
}
