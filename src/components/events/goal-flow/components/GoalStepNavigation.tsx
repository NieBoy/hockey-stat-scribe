
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

  // Always show actions on submit step to ensure the button is visible
  const isSubmitStep = currentStep === 'submit';

  // Show the actions component if shouldShowActions is true or if it's the submit step
  if (!shouldShowActions && !isSubmitStep) {
    return null;
  }

  return <GoalActions 
    isSubmitting={isSubmitting} 
    onCancel={onCancel} 
    showSubmit={currentStep === 'submit'} 
  />;
}
