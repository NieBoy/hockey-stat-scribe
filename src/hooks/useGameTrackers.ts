
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useGameTrackers(gameId: string, userId: string | undefined) {
  const [isTracker, setIsTracker] = useState(false);
  const [statTypes, setStatTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrackerStatus = async () => {
      if (!gameId || !userId) {
        setIsTracker(false);
        setStatTypes([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stat_trackers')
          .select('stat_type')
          .eq('game_id', gameId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error checking tracker status:', error);
          setIsTracker(false);
          setStatTypes([]);
        } else {
          const types = data?.map(item => item.stat_type) || [];
          setIsTracker(types.length > 0);
          setStatTypes(types);
        }
      } catch (error) {
        console.error('Error in checkTrackerStatus:', error);
        setIsTracker(false);
        setStatTypes([]);
      } finally {
        setLoading(false);
      }
    };

    checkTrackerStatus();
  }, [gameId, userId]);

  return { isTracker, statTypes, loading };
}
