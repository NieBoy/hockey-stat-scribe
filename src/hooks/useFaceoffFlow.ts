
import { useState } from 'react';
import { User, Game } from '@/types';
import { toast } from 'sonner';
import { recordFaceoffEvent } from '@/services/events/faceoffEventService';

type FlowStep = 'outcome-select' | 'player-select' | 'submit';

export function useFaceoffFlow(game: Game, period: number, onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('outcome-select');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWinSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setIsWon(true);
    setCurrentStep('player-select');
  };

  const handleLossSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setIsWon(false);
    setCurrentStep('player-select');
  };

  const handlePlayerSelect = (player: User) => {
    setSelectedPlayer(player);
    setCurrentStep('submit');
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !selectedPlayer || game.id === undefined) {
      return;
    }

    setIsSubmitting(true);

    try {
      await recordFaceoffEvent({
        gameId: game.id,
        period,
        teamType: selectedTeam,
        playerId: selectedPlayer.id,
        isWon
      });

      toast.success("Faceoff recorded", {
        description: `${selectedPlayer.name} ${isWon ? 'won' : 'lost'} the faceoff`
      });

      onComplete();
    } catch (error) {
      console.error("Error recording faceoff:", error);
      toast.error("Failed to record faceoff", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    selectedTeam,
    selectedPlayer,
    isWon,
    isSubmitting,
    handleWinSelect,
    handleLossSelect,
    handlePlayerSelect,
    handleSubmit
  };
}
