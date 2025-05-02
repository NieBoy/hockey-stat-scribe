
import React from 'react';
import { Game } from '@/types';
import { useGoalFlow } from '@/hooks/useGoalFlow';
import { StepRenderer } from './StepRenderer';
import { GoalFlowLayout } from './components/GoalFlowLayout';

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
    <GoalFlowLayout
      game={game}
      selectedTeam={selectedTeam}
      currentStep={currentStep}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
    >
      <StepRenderer
        goalFlow={goalFlow}
        game={game}
        onCancel={onCancel}
        period={period}
      />
    </GoalFlowLayout>
  );
}
