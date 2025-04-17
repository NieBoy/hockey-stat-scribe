
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { fetchGameWithTeams } from '@/services/games/queries';
import { User, UserRole } from '@/types';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const statTypes = ['goals', 'assists', 'penalties', 'shots', 'saves'] as const;

export default function StatTrackerAssignment() {
  const { id: gameId } = useParams<{ id: string }>();
  const [game, setGame] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTrackers, setSelectedTrackers] = useState<{
    [key: string]: string | null
  }>({});
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
        console.log('Fetched game data:', gameData);
        setGame(gameData);

        // Get team IDs from the game
        const teamIds = [gameData.home_team_id, gameData.away_team_id];
        const uniqueTeamIds = [...new Set(teamIds)]; // Remove duplicates if same team plays itself
        
        // Fetch all team members for these teams
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
          
          if (members && members.length > 0) {
            console.log(`Found ${members.length} members for team ${teamId}`, members);
            allTeamMembers = [...allTeamMembers, ...members];
          }
        }
        
        // Also include users from users table for backward compatibility
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');

        if (userError) throw userError;
        
        const mappedUsers = userData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user'
        }));
        
        // Combine and deduplicate by ID
        const combinedMembers = [...allTeamMembers];
        
        // Only add users that aren't already in team members
        mappedUsers.forEach(user => {
          if (!combinedMembers.some(member => member.id === user.id)) {
            combinedMembers.push(user);
          }
        });
        
        console.log('Combined team members:', combinedMembers);
        setTeamMembers(combinedMembers);

        // Load existing assignments
        const { data: existingTrackers, error: trackersError } = await supabase
          .from('stat_trackers')
          .select('*')
          .eq('game_id', gameId);

        if (trackersError) throw trackersError;

        console.log('Existing stat trackers:', existingTrackers);
        const currentAssignments: { [key: string]: string } = {};
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
      console.log('Starting stat tracker assignment process');
      console.log('Selected trackers:', selectedTrackers);
      
      // First, delete existing assignments
      const { error: deleteError } = await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      if (deleteError) {
        console.error('Error deleting existing trackers:', deleteError);
        throw deleteError;
      }
      
      // Prepare new assignments
      const trackersToInsert = Object.entries(selectedTrackers)
        .filter(([_, userId]) => userId !== null && userId !== '')
        .map(([statType, userId]) => ({
          game_id: gameId,
          user_id: userId,
          stat_type: statType
        }));
      
      console.log('Inserting new trackers:', trackersToInsert);
      
      // Only insert if we have assignments to make
      if (trackersToInsert.length > 0) {
        const { error } = await supabase
          .from('stat_trackers')
          .insert(trackersToInsert);

        if (error) {
          console.error('Error inserting trackers:', error);
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

  if (loading && !game) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading game data...</p>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to={`/games/${gameId}`} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
            {game ? `Assign Stat Trackers for ${game.home_team?.name || 'Home Team'} vs ${game.away_team?.name || 'Away Team'}` : 'Assign Stat Trackers'}
          </h1>

          <Card className="p-6">
            <div className="grid gap-6">
              {statTypes.map(statType => (
                <div key={statType} className="space-y-2">
                  <h2 className="text-lg font-semibold capitalize">
                    {statType} Tracker
                  </h2>
                  <select
                    value={selectedTrackers[statType] || ''}
                    onChange={(e) => setSelectedTrackers(prev => ({
                      ...prev,
                      [statType]: e.target.value || null
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">Select Tracker</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email} {member.role ? `(${member.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleTrackerAssignment}
              className="mt-6 w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : saveSuccess ? 'Saved Successfully' : 'Save Assignments'}
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
