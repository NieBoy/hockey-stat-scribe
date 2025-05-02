
import { useState } from 'react';
import { User, Game } from '@/types';
import { toast } from 'sonner';
import { recordGoalEvent } from '@/services/events/goalEventService';

export function useGoalSubmission(onComplete: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    gameId: string | undefined, 
    period: number, 
    selectedTeam: 'home' | 'away' | null, 
    playersOnIce: User[], 
    selectedScorer: User | null, 
    primaryAssist: User | null, 
    secondaryAssist: User | null,
    game: Game
  ) => {
    if (!selectedTeam || !gameId) {
      toast.error("Missing Data", {
        description: "Team or game information is missing"
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting goal with players:", playersOnIce);

    try {
      const goalData: {
        gameId: string;
        period: number;
        teamType: 'home' | 'away';
        playersOnIce: string[];
        scorerId?: string;
        primaryAssistId?: string;
        secondaryAssistId?: string;
      } = {
        gameId,
        period,
        teamType: selectedTeam,
        playersOnIce: playersOnIce.map(p => p.id)
      };

      if (selectedScorer) goalData.scorerId = selectedScorer.id;
      if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
      if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      
      console.log("Goal data to be submitted:", goalData);
      await recordGoalEvent(goalData);

      const teamName = selectedTeam === 'home' 
        ? game.homeTeam?.name || 'Home team'
        : game.awayTeam?.name || 'Away team';
        
      toast.success("Goal Recorded", {
        description: `Goal by ${selectedScorer?.name || 'Unknown player'} (${teamName})`
      });

      onComplete();
    } catch (error: any) {
      console.error("Error recording goal:", error);
      toast.error("Error", {
        description: error.message || "Failed to record goal event"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit
  };
}
