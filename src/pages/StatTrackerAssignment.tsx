
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { fetchGameWithTeams } from '@/services/games/queries';
import { User, UserRole } from '@/types';

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
        // Load game details
        const gameData = await fetchGameWithTeams(gameId);
        setGame(gameData);

        // Fetch users who can be stat trackers
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');

        if (userError) throw userError;
        // Map Supabase user data to match our User type
        const mappedUsers = userData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: ['player' as UserRole], // Cast the string to UserRole type
          profileImage: user.avatar_url
        }));
        
        setUsers(mappedUsers);
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
      // Remove existing stat trackers for this game
      await supabase
        .from('stat_trackers')
        .delete()
        .eq('game_id', gameId);

      // Insert new stat trackers
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Assign Stat Trackers for {game.home_team.name} vs {game.away_team.name}
      </h1>

      <div className="grid gap-4">
        {statTypes.map(statType => (
          <div key={statType} className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2 capitalize">
              {statType} Tracker
            </h2>
            <select
              value={selectedTrackers[statType] || ''}
              onChange={(e) => setSelectedTrackers(prev => ({
                ...prev,
                [statType]: e.target.value || null
              }))}
              className="w-full p-2 border rounded"
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
        className="mt-4 w-full"
      >
        Assign Stat Trackers
      </Button>
    </div>
  );
}
