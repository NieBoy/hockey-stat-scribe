import { useState } from 'react';
import { User, Game } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recordPenaltyEvent } from '@/services/events/penalty/penaltyEventService';

type FlowStep = 'team-select' | 'player-select' | 'penalty-type' | 'penalty-duration' | 'additional-penalty' | 'submit';
type PenaltyDuration = 'minor' | 'major';
type AdditionalPenalty = 'none' | 'match' | 'game-misconduct';

export type PenaltyType = 
  | 'hooking'
  | 'tripping'
  | 'interference'
  | 'roughing'
  | 'slashing'
  | 'cross-checking'
  | 'high-sticking'
  | 'holding'
  | 'boarding'
  | 'charging';

export function usePenaltyFlow(game: Game, period: number, onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [selectedPenaltyType, setSelectedPenaltyType] = useState<PenaltyType | null>(null);
  const [penaltyDuration, setPenaltyDuration] = useState<PenaltyDuration | null>(null);
  const [additionalPenalty, setAdditionalPenalty] = useState<AdditionalPenalty>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setCurrentStep('player-select');
  };

  const handlePlayerSelect = (player: User) => {
    setSelectedPlayer(player);
    setCurrentStep('penalty-type');
  };

  const handlePenaltyTypeSelect = (type: PenaltyType) => {
    setSelectedPenaltyType(type);
    setCurrentStep('penalty-duration');
  };

  const handlePenaltyDurationSelect = (duration: PenaltyDuration) => {
    setPenaltyDuration(duration);
    setCurrentStep('additional-penalty');
  };

  const handleAdditionalPenaltySelect = (penalty: AdditionalPenalty) => {
    setAdditionalPenalty(penalty);
    setCurrentStep('submit');
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !selectedPlayer || !selectedPenaltyType || !penaltyDuration || !game.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await recordPenaltyEvent({
        gameId: game.id,
        period,
        teamType: selectedTeam,
        playerId: selectedPlayer.id,
        penaltyType: selectedPenaltyType,
        duration: penaltyDuration,
        additionalPenalty
      });

      toast({
        title: "Penalty Recorded",
        description: `${selectedPenaltyType} penalty by ${selectedPlayer.name}`
      });

      onComplete();
    } catch (error: any) {
      console.error("Error recording penalty:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record penalty",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    selectedTeam,
    selectedPlayer,
    selectedPenaltyType,
    penaltyDuration,
    additionalPenalty,
    isSubmitting,
    handleTeamSelect,
    handlePlayerSelect,
    handlePenaltyTypeSelect,
    handlePenaltyDurationSelect,
    handleAdditionalPenaltySelect,
    handleSubmit
  };
}
