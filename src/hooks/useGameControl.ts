
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';
import { GameStopReason, GameStatus } from '@/types/game-control';
import { useNavigate } from 'react-router-dom';

type TeamType = 'home' | 'away';

interface GameState {
  is_active: boolean;
  current_period: number;
}

export function useGameControl(gameId?: string) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [teamType, setTeamType] = useState<TeamType>('home');
  const [gameStatus, setGameStatus] = useState<GameStatus>('not-started');
  const [stopReason, setStopReason] = useState<GameStopReason>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          toast({
            title: "Error",
            description: "Failed to fetch game state",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          setIsGameActive(data.is_active);
          setCurrentPeriod(data.current_period || 1);
          setGameStatus(data.is_active ? 'in-progress' : 'not-started');
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
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
  }, [gameId, toast]);

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
      setGameStatus('in-progress');
      
      toast({
        title: "Game Started",
        description: "Period 1 has begun"
      });

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive"
      });
    }
  }, [gameId, toast]);

  const stopGame = useCallback(async () => {
    setGameStatus('stopped');
  }, []);

  const handlePeriodEnd = useCallback(async () => {
    if (!gameId) return;

    try {
      if (currentPeriod >= 3) {
        const { error } = await supabase
          .from('games')
          .update({ 
            is_active: false 
          })
          .eq('id', gameId);

        if (error) throw error;
        
        toast({
          title: "Game Ended",
          description: "The game has concluded"
        });
        
        navigate(`/games/${gameId}`);
        return;
      }

      const { error } = await supabase
        .from('games')
        .update({ 
          current_period: currentPeriod + 1,
          is_active: true
        })
        .eq('id', gameId);

      if (error) throw error;

      setGameStatus('in-progress');
      toast({
        title: "Period Advanced",
        description: `Period ${currentPeriod + 1} has begun`
      });

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to handle period end",
        variant: "destructive"
      });
    }
  }, [gameId, currentPeriod, toast, navigate]);

  const handleStoppage = useCallback(async () => {
    if (!gameId) return;
    setGameStatus('in-progress');
  }, [gameId]);

  return {
    isGameActive,
    currentPeriod,
    teamType,
    gameStatus,
    stopReason,
    startGame,
    stopGame,
    handlePeriodEnd,
    handleStoppage,
    setTeamType,
    setStopReason
  };
}
