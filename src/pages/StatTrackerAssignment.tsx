
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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTrackers, setSelectedTrackers] = useState<{
    [key: string]: string | null
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadGameAndUsers = async () => {
      if (!gameId) return;

      try {
        const gameData = await fetchGameWithTeams(gameId);
        setGame(gameData);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');

        if (userError) throw userError;
        
        const mappedUsers = userData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: ['player' as UserRole],
          profileImage: user.avatar_url
        }));
        
        setUsers(mappedUsers);

        // Load existing assignments
        const { data: existingTrackers, error: trackersError } = await supabase
          .from('stat_trackers')
          .select('*')
          .eq('game_id', gameId);

        if (trackersError) throw trackersError;

        const currentAssignments: { [key: string]: string } = {};
        existingTrackers?.forEach(tracker => {
          currentAssignments[tracker.stat_type] = tracker.user_id;
        });
        setSelectedTrackers(currentAssignments);

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load game or users',
          variant: 'destructive'
        });
      }
    };

    loadGameAndUsers();
  }, [gameId, toast]);

  const handleTrackerAssignment = async () => {
    if (!gameId) return;

    try {
      await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      const trackersToInsert = Object.entries(selectedTrackers)
        .filter(([_, userId]) => userId !== null)
        .map(([statType, userId]) => ({
          game_id: gameId,
          user_id: userId,
          stat_type: statType
        }));

      const { error } = await supabase
        .from('stat_trackers')
        .insert(trackersToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stat trackers assigned successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign stat trackers',
        variant: 'destructive'
      });
    }
  };

  if (!game) return <div>Loading...</div>;

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
            Assign Stat Trackers for {game.home_team.name} vs {game.away_team.name}
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
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
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
            >
              Save Assignments
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
