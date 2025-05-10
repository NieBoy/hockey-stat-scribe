
import { useState, useEffect, useCallback } from 'react';
import { User, Team } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useTeamMembers(team: Team, onRemoveMember?: (member: User) => void) {
  const [players, setPlayers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parents, setParents] = useState<User[]>([]); // Add parents state
  
  // Add state for team member management
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [allMembers, setAllMembers] = useState<User[]>([]);
  
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
        
        // Combine all members for the team members table
        setAllMembers([...playerList, ...coachList, ...parentList]);

      } catch (error) {
        console.error("Error in fetchTeamMembers:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [team]);

  // Member selection handler
  const handleSelectMember = useCallback((memberId: string, selected: boolean) => {
    setSelectedMembers(prev => {
      if (selected) {
        return [...prev, memberId];
      } else {
        return prev.filter(id => id !== memberId);
      }
    });
  }, []);

  // Select all members handler
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedMembers(allMembers.map(member => member.id));
    } else {
      setSelectedMembers([]);
    }
  }, [allMembers]);

  // Delete confirmation handler
  const handleDeleteConfirm = useCallback((member: User) => {
    setMemberToDelete(member);
  }, []);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!memberToDelete) return;
    
    try {
      // Call the provided onRemoveMember callback
      if (onRemoveMember) {
        onRemoveMember(memberToDelete);
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('Failed to remove member');
    } finally {
      setMemberToDelete(null);
    }
  }, [memberToDelete, onRemoveMember]);

  return { 
    players, 
    coaches, 
    parents, 
    loading, 
    error, 
    selectedMembers,
    memberToDelete,
    allMembers,
    handleSelectMember,
    handleSelectAll,
    handleDeleteConfirm,
    handleDelete,
    setMemberToDelete
  };
}
