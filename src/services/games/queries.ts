
import { supabase } from '@/lib/supabase';
import { Game } from '@/types';
import { GameDbResponse } from './types';

export const fetchTeamMembers = async (teamId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId);
    
  if (error) throw error;
  return data || [];
};

export const fetchGameWithTeams = async (gameId?: string) => {
  const query = supabase
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
    
  if (gameId) {
    const { data, error } = await query.eq('id', gameId).single();
    if (error) throw error;
    return data as GameDbResponse;
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as GameDbResponse[];
};

export const createNewGame = async (
  date: Date,
  location: string,
  homeTeamId: string,
  awayTeamId: string,
  periods: number
) => {
  const { data, error } = await supabase
    .from('games')
    .insert({
      date: date.toISOString(),
      location: location,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      periods: periods,
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
    
  if (error) throw error;
  return data as GameDbResponse;
};
