
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

type TeamType = 'home' | 'away';

interface GameState {
  is_active: boolean;
  current_period: number;
}

export function useGameControl(gameId?: string) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [teamType, setTeamType] = useState<TeamType>('home');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!gameId) return;

    // Fetch initial game state
    const fetchGameState = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('is_active, current_period')
        .eq('id', gameId)
        .single();

      if (error) {
        setError('Failed to fetch game state');
        return;
      }

      if (data) {
        setIsGameActive(data.is_active);
        setCurrentPeriod(data.current_period || 1);
      }
    };

    fetchGameState();

    // Subscribe to game state changes
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
          const newData = payload.new as GameState;
          if (newData) {
            setIsGameActive(newData.is_active);
            setCurrentPeriod(newData.current_period || 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const startGame = useCallback(async () => {
    if (!gameId) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ 
          is_active: true, 
          current_period: 1 
        })
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: "Game Started",
        description: "Period 1 has begun"
      });

    } catch (err) {
      setError('Failed to start game');
    }
  }, [gameId, toast]);

  const stopGame = useCallback(async () => {
    if (!gameId) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ 
          is_active: false 
        })
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: "Game Stopped",
        description: "The game has been paused"
      });

    } catch (err) {
      setError('Failed to stop game');
    }
  }, [gameId, toast]);

  const advancePeriod = useCallback(async () => {
    if (!gameId) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ 
          current_period: currentPeriod + 1 
        })
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: "Period Advanced",
        description: `Period ${currentPeriod + 1} has begun`
      });

    } catch (err) {
      setError('Failed to advance period');
    }
  }, [gameId, currentPeriod, toast]);

  return {
    isGameActive,
    currentPeriod,
    teamType,
    startGame,
    stopGame,
    setTeamType,
    advancePeriod,
    error
  };
}
