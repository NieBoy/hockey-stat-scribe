
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { fetchGameWithTeams } from '@/services/games/queries';
import { useAuth } from '@/hooks/useAuth';

export type StatAssignment = {
  [key: string]: string | null;
};

export const useStatTrackerAssignment = (gameId: string | undefined) => {
  const [game, setGame] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTrackers, setSelectedTrackers] = useState<StatAssignment>({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadGameAndTeamMembers = async () => {
      if (!gameId) return;
      setLoading(true);

      try {
        // Load game data
        const gameData = await fetchGameWithTeams(gameId);
        if (!gameData || Array.isArray(gameData)) {
          throw new Error('Invalid game data received');
        }
        setGame(gameData);

        // Get team IDs from the game
        const teamIds = [gameData.home_team_id, gameData.away_team_id];
        
        // Fetch all team members from both teams
        const { data: allMembers, error: membersError } = await supabase
          .from('team_members')
          .select('id, user_id, name, email, role')
          .in('team_id', teamIds);
        
        if (membersError) throw membersError;
        
        // Fetch all available users (not just those connected to teams)
        const { data: allUsers, error: usersError } = await supabase
          .from('users')
          .select('id, name, email');
          
        if (usersError) throw usersError;
        
        // Create a map of users for quick lookup
        const usersMap = new Map(allUsers?.map(user => [user.id, user]) || []);
        
        // Create a combined list of potential stat trackers
        const validTrackers = [];
        
        // Add team members with valid user_id connections
        for (const member of (allMembers || [])) {
          if (member.user_id && usersMap.has(member.user_id)) {
            const user = usersMap.get(member.user_id);
            validTrackers.push({
              id: member.user_id,
              name: member.name || user?.name || 'Unknown',
              email: member.email || user?.email || 'No email',
              role: member.role || 'player'
            });
          }
        }
        
        // Add users that aren't already in the list as potential trackers
        for (const user of (allUsers || [])) {
          if (!validTrackers.some(t => t.id === user.id)) {
            validTrackers.push({
              id: user.id,
              name: user.name,
              email: user.email,
              role: 'user'
            });
          }
        }
        
        console.log('Valid trackers for assignment:', validTrackers);
        setTeamMembers(validTrackers);

        // Load existing assignments
        const { data: existingTrackers, error: trackersError } = await supabase
          .from('stat_trackers')
          .select('*')
          .eq('game_id', gameId);

        if (trackersError) throw trackersError;

        const currentAssignments: StatAssignment = {};
        existingTrackers?.forEach(tracker => {
          currentAssignments[tracker.stat_type] = tracker.user_id;
        });
        setSelectedTrackers(currentAssignments);

      } catch (error) {
        console.error('Error loading game or team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game or team members',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadGameAndTeamMembers();
  }, [gameId, toast]);

  const handleTrackerAssignment = async () => {
    if (!gameId || !user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to assign stat trackers',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    setSaveSuccess(false);

    try {
      console.log('Current user ID:', user.id);
      console.log('Selected trackers:', selectedTrackers);
      
      // Verify all selected users exist in the users table
      const userIds = Object.values(selectedTrackers).filter(Boolean) as string[];
      if (userIds.length > 0) {
        const { data: validUsers, error: validationError } = await supabase
          .from('users')
          .select('id')
          .in('id', userIds);
          
        if (validationError) throw validationError;
        
        // Check if all selected users exist
        const validUserIds = validUsers?.map(u => u.id) || [];
        const invalidIds = userIds.filter(id => !validUserIds.includes(id));
        
        if (invalidIds.length > 0) {
          console.error('Invalid user IDs detected:', invalidIds);
          toast({
            title: 'Error',
            description: 'Some selected users are invalid. Please select valid users only.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
      }
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
      
      // Prepare new assignments
      const trackersToInsert = Object.entries(selectedTrackers)
        .filter(([_, userId]) => userId !== null && userId !== '')
        .map(([statType, userId]) => ({
          game_id: gameId,
          user_id: userId,
          stat_type: statType,
          created_at: new Date().toISOString()
        }));
      
      console.log('Inserting trackers:', trackersToInsert);
      
      if (trackersToInsert.length > 0) {
        const { error } = await supabase
          .from('stat_trackers')
          .insert(trackersToInsert);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }

      setSaveSuccess(true);
      toast({
        title: 'Success',
        description: 'Stat trackers assigned successfully'
      });
    } catch (error) {
      console.error('Error in handleTrackerAssignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign stat trackers. Please check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    game,
    teamMembers,
    selectedTrackers,
    setSelectedTrackers,
    loading,
    saveSuccess,
    handleTrackerAssignment
  };
};
