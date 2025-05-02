
import React from 'react';
import { Card } from '@/components/ui/card';
import { Game } from '@/types';
import { GoalHeader } from './GoalHeader';
import { GoalActions } from './GoalActions';
import { useGoalFlow } from '@/hooks/useGoalFlow';
import { StepRenderer } from './StepRenderer';

interface GoalFlowContainerProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function GoalFlowContainer({
  game,
  period,
  onComplete,
  onCancel
}: GoalFlowContainerProps) {
  const goalFlow = useGoalFlow(game, period, onComplete);
  
  const {
    currentStep,
    selectedTeam,
    isSubmitting,
  } = goalFlow;

  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      <StepRenderer
        goalFlow={goalFlow}
        game={game}
        onCancel={onCancel}
        period={period}
      />
      {currentStep !== 'submit' && currentStep !== 'players-on-ice' && currentStep !== 'opponent-goal' && (
        <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />
      )}
    </Card>
  );
}
