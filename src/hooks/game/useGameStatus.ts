
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { GameStatus, GameStopReason } from '@/types/game-control';

export function useGameStatus(gameId?: string) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('not-started');
  const [stopReason, setStopReason] = useState<GameStopReason>(null);
  const { toast } = useToast();

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

      if (error) {
        console.error("Error starting game:", error);
        throw error;
      }
      
      setIsGameActive(true);
      setGameStatus('in-progress');
      
      toast({
        title: "Game Started",
        description: "Period 1 has begun"
      });
      
      console.log("Game started, updated state:", { isGameActive: true, currentPeriod: 1, gameStatus: 'in-progress' });

    } catch (err) {
      console.error("Exception in startGame:", err);
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive"
      });
    }
  }, [gameId, toast]);

  const stopGame = useCallback(() => {
    console.log("Stopping game, setting status to 'stopped'");
    setGameStatus('stopped');
  }, []);

  const handleStoppage = useCallback(() => {
    if (!gameId) return;
    
    console.log("Resuming from stoppage, setting status back to 'in-progress'");
    setGameStatus('in-progress');
  }, [gameId]);

  return {
    isGameActive,
    setIsGameActive,
    gameStatus,
    setGameStatus,
    stopReason,
    setStopReason,
    startGame,
    stopGame,
    handleStoppage
  };
}
