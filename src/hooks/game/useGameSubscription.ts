
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
          if (gameStatus === 'not-started' || data.is_active) {
            // Set is_active state from DB only if it's true
            // This prevents overriding local "active" state when DB hasn't updated yet
            if (data.is_active) {
              setIsGameActive(data.is_active);
            }
            
            // Only set current period if it's greater than 0 to avoid resetting UI
            if (data.current_period > 0) {
              setCurrentPeriod(data.current_period);
            }
            
            // Only update status if we're not in a stopped state and DB shows active
            if (gameStatus !== 'stopped' && data.is_active) {
              setGameStatus('in-progress');
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
            
            // For consistency, only update is_active from DB if it's true
            // This prevents overriding our local state before DB catches up
            if (newData.is_active) {
              setIsGameActive(newData.is_active);
              
              // Only update game status if we're not in a special state and DB shows active
              setGameStatus('in-progress');
              console.log("Updated game status to in-progress based on DB active=true");
            }
            
            // Only update period if it's a valid value (>0)
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
