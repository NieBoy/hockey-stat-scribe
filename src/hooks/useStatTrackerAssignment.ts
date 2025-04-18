
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
        
        console.log('Game data loaded:', gameData);

        // Get team members from both teams for this game
        const { data: homeTeamMembers, error: homeError } = await supabase
          .from('team_members')
          .select('id, user_id, name, email, role')
          .eq('team_id', gameData.home_team.id);
          
        if (homeError) {
          console.error('Error fetching home team members:', homeError);
          throw homeError;
        }
        
        const { data: awayTeamMembers, error: awayError } = await supabase
          .from('team_members')
          .select('id, user_id, name, email, role')
          .eq('team_id', gameData.away_team.id);
          
        if (awayError) {
          console.error('Error fetching away team members:', awayError);
          throw awayError;
        }
        
        // Combine team members and coaches from both teams
        const allTeamMembers = [...(homeTeamMembers || []), ...(awayTeamMembers || [])];
        
        console.log('Retrieved team members count:', allTeamMembers.length);
        console.log('Team members:', allTeamMembers);
        
        // Format team members for display
        const availableTrackers = allTeamMembers.map(member => ({
          id: member.user_id || member.id, // Use user_id if available, otherwise use team_member id
          name: member.name || member.email || 'Unknown',
          email: member.email,
          role: member.role || 'member'
        }));
        
        console.log('Available trackers for stat tracking:', availableTrackers);
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
        
        console.log('Current stat tracker assignments:', currentAssignments);
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
      
      // Prepare new assignments
      const trackersToInsert = Object.entries(selectedTrackers)
        .filter(([_, userId]) => userId !== null && userId !== "")
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
