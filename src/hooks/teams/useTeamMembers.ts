import { useState, useEffect } from 'react';
import { User, Team } from '@/types';
import { supabase } from '@/lib/supabase';

export function useTeamMembers(team: Team) {
  const [players, setPlayers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parents, setParents] = useState<User[]>([]); // Add parents state

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .neq('role', 'coach');

        if (playersError) {
          console.error("Error fetching players:", playersError);
          setError("Failed to load players");
        } else {
          const playerList: User[] = playersData.map(player => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            email: player.email || undefined,
            role: [player.role as any || 'player'],
            position: player.position,
            number: player.line_number ? String(player.line_number) : undefined,
            teams: [{ id: team.id, name: team.name }],
            avatar_url: null
          }));
          setPlayers(playerList);
        }

        // Fetch coaches
        const { data: coachesData, error: coachesError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .eq('role', 'coach');

        if (coachesError) {
          console.error("Error fetching coaches:", coachesError);
          setError("Failed to load coaches");
        } else {
          const coachList: User[] = coachesData.map(coach => ({
            id: coach.id,
            name: coach.name || 'Unknown Coach',
            email: coach.email || undefined,
            role: [coach.role as any || 'coach'],
            teams: [{ id: team.id, name: team.name }],
            avatar_url: null
          }));
          setCoaches(coachList);
        }

        // Fetch parents (assuming there's a relation to team)
        const { data: parentsData, error: parentsError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .eq('role', 'parent');

        if (parentsError) {
          console.error("Error fetching parents:", parentsError);
        } else {
          const parentList: User[] = parentsData.map(parent => ({
            id: parent.id,
            name: parent.name || 'Unknown Parent',
            email: parent.email || undefined,
            role: [parent.role as any || 'parent'],
            teams: [{ id: team.id, name: team.name }],
            avatar_url: null
          }));
          setParents(parentList);
        }

      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [team]);

  return { players, coaches, parents, loading, error };
}
