
import React from 'react';
import { GoalActions } from '../GoalActions';

interface GoalStepNavigationProps {
  currentStep: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function GoalStepNavigation({
  currentStep,
  isSubmitting,
  onCancel
}: GoalStepNavigationProps) {
  // Only show the actions for certain steps
  const shouldShowActions = 
    currentStep !== 'submit' && 
    currentStep !== 'players-on-ice' && 
    currentStep !== 'opponent-goal';

  if (!shouldShowActions) {
    return null;
  }

  return <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />;
}
