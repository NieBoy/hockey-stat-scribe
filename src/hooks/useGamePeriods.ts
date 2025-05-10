
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Game } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useGamePeriods(game: Game | null) {
  const [currentPeriod, setCurrentPeriod] = useState<number>(game?.current_period || 0);
  const { toast } = useToast();

  const updatePeriod = useCallback(async (period: number) => {
    if (!game?.id) return false;
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ current_period: period })
        .eq('id', game.id);

      if (error) throw error;
      
      setCurrentPeriod(period);
      return true;
    } catch (error) {
      console.error('Failed to update period:', error);
      toast({
        title: "Error",
        description: "Failed to update period",
        variant: "destructive"
      });
      return false;
    }
  }, [game?.id, toast]);

  return {
    currentPeriod,
    setCurrentPeriod: updatePeriod
  };
}
