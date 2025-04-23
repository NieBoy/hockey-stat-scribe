import { useState } from 'react';
import { User, Game } from '@/types';
import { toast } from 'sonner';
import { recordShotEvent } from '@/services/events/shots/shotsEventService';

type FlowStep = 'team-select' | 'player-select' | 'submit';

export function useShotsFlow(game: Game, period: number, onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [isForUs, setIsForUs] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTeamSelect = (forUs: boolean) => {
    setIsForUs(forUs);
    setSelectedTeam(forUs ? game.homeTeam.id === game.id ? 'home' : 'away' 
                        : game.homeTeam.id === game.id ? 'away' : 'home');
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
      await recordShotEvent({
        gameId: game.id,
        period,
        teamType: selectedTeam,
        playerId: selectedPlayer.id,
        isForUs
      });

      toast.success("Shot recorded", {
        description: isForUs 
          ? `Shot recorded for ${selectedPlayer.name}`
          : `Shot against recorded for ${selectedPlayer.name}`
      });

      onComplete();
    } catch (error) {
      console.error("Error recording shot:", error);
      toast.error("Failed to record shot");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    selectedTeam,
    selectedPlayer,
    isForUs,
    isSubmitting,
    handleTeamSelect,
    handlePlayerSelect,
    handleSubmit
  };
}
