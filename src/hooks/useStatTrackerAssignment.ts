
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

        // Get ALL users from the database with detailed logging
        console.log('Fetching ALL users for stat tracking assignment...');
        const { data: allUsers, error: usersError } = await supabase
          .from('users')
          .select('*');
          
        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        console.log('Retrieved users (detailed):', allUsers);
        console.log('Current logged in user ID:', user?.id);
        
        // Make sure we're getting an array of users
        if (!Array.isArray(allUsers)) {
          console.error('Users data is not an array:', allUsers);
          throw new Error('Invalid users data format');
        }
        
        console.log('Retrieved users count:', allUsers.length);
        
        // Create a list of all users as potential trackers
        const availableTrackers = allUsers.map(user => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: 'user'
        }));
        
        console.log('Available users for stat tracking:', availableTrackers);
        setTeamMembers(availableTrackers);

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
        console.error('Error loading game or users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game or users',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadGameAndTeamMembers();
  }, [gameId, toast, user?.id]);

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
      
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
      
      // Verify users exist before assigning
      const userIds = Object.values(selectedTrackers)
        .filter(userId => userId !== null && userId !== '');
      
      if (userIds.length > 0) {
        const { data: validUsers, error: validationError } = await supabase
          .from('users')
          .select('id')
          .in('id', userIds);
        
        if (validationError) {
          console.error('User validation error:', validationError);
          throw validationError;
        }
        
        console.log('Valid user IDs found:', validUsers?.map(u => u.id));
        
        // Prepare new assignments (only for valid users)
        const trackersToInsert = Object.entries(selectedTrackers)
          .filter(([_, userId]) => userId !== null && userId !== '')
          .filter(([_, userId]) => validUsers?.some(u => u.id === userId))
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
