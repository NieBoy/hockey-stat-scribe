
// Import the required modules and types
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Player } from '@/types';

export function useLineupData(teamId: string) {
  const [players, setPlayers] = useState<(User | Player)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTeamLineup() {
      if (!teamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, email, position, line_number, role')
          .eq('team_id', teamId)
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
          team_id: teamId,
        }));

        setPlayers(mappedPlayers);
      } catch (err) {
        console.error('Error loading team lineup:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadTeamLineup();
  }, [teamId]);

  return { players, loading, error };
}
