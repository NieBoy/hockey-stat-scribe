
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
      console.log("Starting game...");
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
      
      // Important: Set local state AFTER database update succeeds
      setIsGameActive(true);
      setGameStatus('in-progress');
      
      toast({
        title: "Game Started",
        description: "Period 1 has begun"
      });
      
      console.log("Game started, updated local state:", { isGameActive: true, currentPeriod: 1, gameStatus: 'in-progress' });

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
    // Important: Only update local state, don't update DB
    // This preserves the stopped state which needs user input to proceed
    setGameStatus('stopped');
  }, []);

  const handleStoppage = useCallback(async () => {
    if (!gameId) return;
    
    try {
      console.log("Resuming from stoppage, setting status back to 'in-progress'");
      
      // Update the database to ensure game is still active
      const { error } = await supabase
        .from('games')
        .update({ is_active: true })
        .eq('id', gameId);
        
      if (error) {
        console.error("Error resuming game after stoppage:", error);
        throw error;
      }
      
      // Update local state
      setIsGameActive(true);
      setGameStatus('in-progress');
      
      toast({
        title: "Game Resumed",
        description: "Game is now in progress"
      });
    } catch (err) {
      console.error("Error handling stoppage:", err);
      toast({
        title: "Error",
        description: "Failed to resume game",
        variant: "destructive"
      });
    }
  }, [gameId, toast]);

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
