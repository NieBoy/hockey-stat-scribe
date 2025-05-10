
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { GameStatus, GameStopReason } from '@/types/game-control';

export function useGameStatus(gameId: string, initialStatus?: boolean) {
  const [isActive, setIsActive] = useState<boolean>(initialStatus || false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(initialStatus ? 'in-progress' : 'not-started');
  const [stopReason, setStopReason] = useState<GameStopReason>(null);
  const { toast } = useToast();

  const toggleGameStatus = useCallback(async () => {
    if (!gameId) return false;
    
    const newStatus = !isActive;
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_active: newStatus })
        .eq('id', gameId);

      if (error) throw error;
      
      setIsActive(newStatus);
      setGameStatus(newStatus ? 'in-progress' : 'stopped');
      
      // Reset stop reason when game becomes active
      if (newStatus) {
        setStopReason(null);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update game status:', error);
      toast({
        title: "Error",
        description: "Failed to update game status",
        variant: "destructive"
      });
      return false;
    }
  }, [gameId, isActive, toast]);

  return { 
    isActive, 
    gameStatus, 
    stopReason,
    setGameStatus,
    setStopReason,
    toggleGameStatus 
  };
}
