
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useGameDetail() {
  const { id } = useParams<{ id: string }>();
  const [isStatTracker, setIsStatTracker] = useState(false);
  const [assignedStatTypes, setAssignedStatTypes] = useState<string[]>([]);
  const { user } = useAuth();
  const isCoach = user?.role.includes('coach');

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => id ? getGameById(id) : null,
    enabled: !!id
  });

  useEffect(() => {
    const checkStatTrackerStatus = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('stat_trackers')
          .select('stat_type')
          .eq('game_id', id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking stat tracker status:', error);
          return;
        }
        
        const statTypes = data?.map(item => item.stat_type) || [];
        setIsStatTracker(statTypes.length > 0);
        setAssignedStatTypes(statTypes);
      } catch (error) {
        console.error('Error in checkStatTrackerStatus:', error);
      }
    };
    
    checkStatTrackerStatus();
  }, [id, user]);

  return {
    game,
    isLoading,
    error,
    isStatTracker,
    assignedStatTypes,
    isCoach,
    id
  };
}
