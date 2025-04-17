
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { fetchGameWithTeams } from '@/services/games/queries';

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
        const uniqueTeamIds = [...new Set(teamIds)];
        
        let allTeamMembers: any[] = [];
        
        for (const teamId of uniqueTeamIds) {
          const { data: members, error } = await supabase
            .from('team_members')
            .select('id, name, email, role')
            .eq('team_id', teamId);
            
          if (error) {
            console.error(`Error fetching members for team ${teamId}:`, error);
            continue;
          }
          
          if (members) {
            allTeamMembers = [...allTeamMembers, ...members];
          }
        }
        
        // Add users from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');

        if (userError) throw userError;
        
        const mappedUsers = userData?.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user'
        })) || [];
        
        const combinedMembers = [...allTeamMembers];
        mappedUsers.forEach(user => {
          if (!combinedMembers.some(member => member.id === user.id)) {
            combinedMembers.push(user);
          }
        });
        
        setTeamMembers(combinedMembers);

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
    if (!gameId) return;
    setLoading(true);
    setSaveSuccess(false);

    try {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      if (deleteError) throw deleteError;
      
      // Prepare new assignments
      const trackersToInsert = Object.entries(selectedTrackers)
        .filter(([_, userId]) => userId !== null && userId !== '')
        .map(([statType, userId]) => ({
          game_id: gameId,
          user_id: userId,
          stat_type: statType
        }));
      
      if (trackersToInsert.length > 0) {
        const { error } = await supabase
          .from('stat_trackers')
          .insert(trackersToInsert);

        if (error) throw error;
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
        description: 'Failed to assign stat trackers',
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
