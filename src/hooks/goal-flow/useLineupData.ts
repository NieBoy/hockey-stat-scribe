
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Player, Game } from '@/types';

type TeamType = 'home' | 'away';

interface UseLineupDataReturn {
  players: (User | Player)[];
  loading: boolean;
  error: Error | null;
  hasLoadedLineups: boolean;
  isLoadingLineups: boolean;
  loadLineupData: (game: Game, teamType: TeamType) => Promise<void>;
  handleRefreshLineups: (game: Game, teamType: TeamType) => Promise<void>;
}

export function useLineupData(teamId?: string): UseLineupDataReturn {
  const [players, setPlayers] = useState<(User | Player)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);

  const loadTeamLineup = async (id: string) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, email, position, line_number, role')
        .eq('team_id', id)
        .eq('role', 'player');

      if (error) throw error;

      // Map the data to Player objects with the required role property
      const mappedPlayers: Player[] = (data || []).map(player => ({
        id: player.id,
        name: player.name,
        email: player.email,
        position: player.position,
        lineNumber: player.line_number,
        role: player.role || 'player', // Add the required role property
        team_id: id,
      }));

      setPlayers(mappedPlayers);
      setHasLoadedLineups(true);
    } catch (err) {
      console.error('Error loading team lineup:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadTeamLineup(teamId);
    }
  }, [teamId]);

  const loadLineupData = async (game: Game, teamType: TeamType) => {
    if (!game) return;
    
    const targetTeamId = teamType === 'home' ? game.home_team_id : game.away_team_id;
    
    if (!targetTeamId) {
      console.error('No team ID found for the requested team type:', teamType);
      return;
    }
    
    await loadTeamLineup(targetTeamId);
  };

  const handleRefreshLineups = async (game: Game, teamType: TeamType) => {
    setHasLoadedLineups(false);
    await loadLineupData(game, teamType);
  };

  return { 
    players, 
    loading, 
    error,
    hasLoadedLineups,
    isLoadingLineups: loading,
    loadLineupData,
    handleRefreshLineups
  };
}
