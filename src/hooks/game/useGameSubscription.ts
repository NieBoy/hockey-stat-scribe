
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
          setIsGameActive(data.is_active);
          setCurrentPeriod(data.current_period || 1);
          setGameStatus(data.is_active ? 'in-progress' : 'not-started');
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
            setIsGameActive(newData.is_active);
            setCurrentPeriod(newData.current_period || 1);
            
            if (gameStatus !== 'stopped') {
              setGameStatus(newData.is_active ? 'in-progress' : 'not-started');
              console.log("Updated game status to:", newData.is_active ? 'in-progress' : 'not-started');
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
