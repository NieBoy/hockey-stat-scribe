
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Team } from '@/types';

export function useTeamMembers(teamId: string) {
  const [players, setPlayers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch team members with their roles
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            name,
            email,
            position,
            role,
            line_number
          `)
          .eq('team_id', teamId);

        if (membersError) throw membersError;

        // Process members by role
        const playersList: User[] = [];
        const coachesList: User[] = [];
        const parentsList: User[] = [];

        members?.forEach(member => {
          const user: User = {
            id: member.id,
            name: member.name || 'Unknown',
            email: member.email || '',
            avatar_url: null,
            role: member.role as any,
            position: member.position,
            lineNumber: member.line_number
          };

          if (member.role === 'player') {
            playersList.push(user);
          } else if (member.role === 'coach') {
            coachesList.push(user);
          } else if (member.role === 'parent') {
            parentsList.push(user);
          }
        });

        setPlayers(playersList);
        setCoaches(coachesList);
        setParents(parentsList);
      } catch (err: any) {
        console.error('Error fetching team members:', err);
        setError(err.message || 'Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const allMembers = [...players, ...coaches, ...parents];

  return {
    players,
    coaches,
    parents,
    loading,
    error,
    allMembers
  };
}
