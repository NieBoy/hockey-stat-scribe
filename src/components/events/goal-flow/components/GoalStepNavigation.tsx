
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
  // We need to show actions on the submit step for goal recording 
  const shouldShowActions = 
    currentStep !== 'players-on-ice' && 
    currentStep !== 'opponent-goal';

  if (!shouldShowActions) {
    return null;
  }

  return <GoalActions 
    isSubmitting={isSubmitting} 
    onCancel={onCancel} 
    showSubmit={currentStep === 'submit'} 
  />;
}
