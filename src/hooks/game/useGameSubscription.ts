
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
          console.log("Initial game state loaded:", data);
          
          // Only update if we're not in a special state
          if (gameStatus !== 'stopped') {
            setIsGameActive(data.is_active);
            // Only set current period if it's greater than 0 to avoid resetting UI
            if (data.current_period > 0) {
              setCurrentPeriod(data.current_period);
            }
            // Only update status if we're not in a stopped state
            setGameStatus(data.is_active ? 'in-progress' : 'not-started');
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
          console.log("Realtime update received:", newData);
          
          if (newData) {
            // Important: Only sync certain states to prevent UI flickering
            // Don't override local stopped state with DB updates
            if (gameStatus !== 'stopped') {
              setIsGameActive(newData.is_active);
              
              // Only update period if it's a valid value (>0)
              if (newData.current_period > 0) {
                setCurrentPeriod(newData.current_period);
              }
              
              // Only update game status if we're not in a special state
              setGameStatus(newData.is_active ? 'in-progress' : 'not-started');
              console.log("Updated game status to:", newData.is_active ? 'in-progress' : 'not-started');
            } else {
              console.log("Ignoring DB update because game is in stopped state:", gameStatus);
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
