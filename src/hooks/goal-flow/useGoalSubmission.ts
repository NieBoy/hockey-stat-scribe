
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
    game: Game,
    isOpponentTeam: boolean = false,
    opponentJerseyNumbers?: {
      scorer: string;
      primaryAssist: string;
      secondaryAssist: string;
    }
  ) => {
    if (!selectedTeam || !gameId) {
      toast.error("Missing Data", {
        description: "Team or game information is missing"
      });
      return;
    }

    console.log("Goal submission started", { 
      gameId, 
      period, 
      selectedTeam, 
      playersCount: playersOnIce.length,
      isOpponentTeam,
      opponentJerseyNumbers 
    });
    
    setIsSubmitting(true);
    
    try {
      const goalData: {
        gameId: string;
        period: number;
        teamType: 'home' | 'away';
        playersOnIce: string[];
        scorerId?: string;
        primaryAssistId?: string;
        secondaryAssistId?: string;
        opponentData?: {
          scorerJersey?: string;
          primaryAssistJersey?: string;
          secondaryAssistJersey?: string;
        };
      } = {
        gameId,
        period,
        teamType: selectedTeam,
        playersOnIce: playersOnIce.map(p => p.id)
      };

      // Handle opponent team differently
      if (isOpponentTeam && opponentJerseyNumbers) {
        goalData.opponentData = {
          scorerJersey: opponentJerseyNumbers.scorer || undefined,
          primaryAssistJersey: opponentJerseyNumbers.primaryAssist || undefined,
          secondaryAssistJersey: opponentJerseyNumbers.secondaryAssist || undefined
        };
      } else {
        // Regular team goal
        if (selectedScorer) goalData.scorerId = selectedScorer.id;
        if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
        if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      }
      
      console.log("Goal data to be submitted:", goalData);
      await recordGoalEvent(goalData);

      const teamName = selectedTeam === 'home' 
        ? game.homeTeam?.name || 'Home team'
        : game.awayTeam?.name || 'Away team';
        
      let scorerName = 'Unknown player';
      if (isOpponentTeam && opponentJerseyNumbers?.scorer) {
        scorerName = `#${opponentJerseyNumbers.scorer}`;
      } else if (selectedScorer?.name) {
        scorerName = selectedScorer.name;
      }

      toast.success("Goal Recorded", {
        description: `Goal by ${scorerName} (${teamName})`
      });

      console.log("Goal recorded successfully, calling onComplete");
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
