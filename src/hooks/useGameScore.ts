
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useGameScore(gameId: string) {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      if (!gameId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get all goals for this game
        const { data: goals, error } = await supabase
          .from('game_events')
          .select('team_type')
          .eq('game_id', gameId)
          .eq('event_type', 'goal');

        if (error) throw error;

        // Count goals by team type
        let homeGoals = 0;
        let awayGoals = 0;
        
        goals?.forEach(goal => {
          if (goal.team_type === 'home') homeGoals++;
          else if (goal.team_type === 'away') awayGoals++;
        });

        setHomeScore(homeGoals);
        setAwayScore(awayGoals);
      } catch (err) {
        console.error('Error fetching game scores:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching game scores'));
      } finally {
        setLoading(false);
      }
    };

    fetchScores();

    // Setup subscription for real-time updates
    const channel = supabase
      .channel(`game_score_${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_events',
          filter: `game_id=eq.${gameId}` 
        },
        (payload) => {
          // If an event is added, deleted or updated, recalculate scores
          fetchScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { homeScore, awayScore, loading, error };
}
