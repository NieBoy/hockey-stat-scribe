
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function usePeriodControl(gameId?: string) {
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePeriodEnd = useCallback(async () => {
    if (!gameId) return;

    try {
      if (currentPeriod >= 3) {
        console.log("Final period reached, ending game");
        
        const { error } = await supabase
          .from('games')
          .update({ 
            is_active: false,
            current_period: currentPeriod 
          })
          .eq('id', gameId);

        if (error) {
          console.error("Error ending game:", error);
          throw error;
        }
        
        toast({
          title: "Game Ended",
          description: "The game has concluded"
        });
        
        console.log("Game ended after period", currentPeriod);
        navigate(`/games/${gameId}`);
        return;
      }

      const nextPeriod = currentPeriod + 1;
      console.log("Advancing to next period:", nextPeriod);
      
      // First update the database
      const { error } = await supabase
        .from('games')
        .update({ 
          current_period: nextPeriod,
          is_active: true  // This ensures the game stays active after period change
        })
        .eq('id', gameId);

      if (error) {
        console.error("Error advancing period:", error);
        throw error;
      }

      // Then update local state
      setCurrentPeriod(nextPeriod);
      
      console.log("Period advanced, new state:", { currentPeriod: nextPeriod });
      
      toast({
        title: "Period Advanced",
        description: `Period ${nextPeriod} has begun`
      });

    } catch (err) {
      console.error("Error handling period end:", err);
      toast({
        title: "Error",
        description: "Failed to handle period end",
        variant: "destructive"
      });
    }
  }, [gameId, currentPeriod, toast, navigate]);

  return {
    currentPeriod,
    setCurrentPeriod,
    handlePeriodEnd
  };
}
