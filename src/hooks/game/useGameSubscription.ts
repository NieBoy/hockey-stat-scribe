
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GameStatus } from '@/types/game-control';

interface UseGameSubscriptionProps {
  gameId?: string;
  setIsGameActive: (isActive: boolean) => void;
  setCurrentPeriod: (period: number) => void;
  setGameStatus: (status: GameStatus) => void;
  gameStatus: GameStatus;
}

export function useGameSubscription({
  gameId,
  setIsGameActive,
  setCurrentPeriod,
  setGameStatus,
  gameStatus
}: UseGameSubscriptionProps) {
  useEffect(() => {
    if (!gameId) return;

    const fetchGameState = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('is_active, current_period')
          .eq('id', gameId)
          .single();

        if (error) {
          console.error("Error fetching game state:", error);
          return;
        }

        if (data) {
          console.log("Initial game state loaded from DB:", data);
          
          // Only update local state if we're not already in a special state
          // and only if DB has a valid active game
          if (gameStatus === 'not-started') {
            // Set is_active state from DB if game is active
            if (data.is_active) {
              setIsGameActive(data.is_active);
              setGameStatus('in-progress');
              console.log("Setting initial game status to in-progress based on DB");
            }
            
            // Only set current period if it's greater than 0 to avoid resetting UI
            if (data.current_period > 0) {
              setCurrentPeriod(data.current_period);
              console.log("Setting initial period to:", data.current_period);
            }
          }
        }
      } catch (err) {
        console.error("Exception in fetchGameState:", err);
      }
    };

    fetchGameState();

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          const newData = payload.new as { is_active: boolean; current_period: number };
          console.log("Realtime update received from DB:", newData);
          
          if (newData) {
            // Important: Only sync certain states to prevent UI flickering
            // Don't override local state with DB updates if we're in a special UI state
            // or if the DB hasn't caught up with our local state yet
            
            if (gameStatus === 'stopped') {
              console.log("Ignoring DB update because game is in stopped state:", gameStatus);
              return;
            }
            
            // For consistency, only update period if it's a valid value (>0)
            if (newData.current_period > 0) {
              setCurrentPeriod(newData.current_period);
              console.log("Updated period to:", newData.current_period);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, gameStatus, setCurrentPeriod, setGameStatus, setIsGameActive]);
}
