
import { useState } from 'react';

type FlowStep = 'team-select' | 'scorer-select' | 'primary-assist' | 'secondary-assist' | 'players-on-ice' | 'submit' | 'opponent-goal';

export function useFlowNavigation() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const goToScorerStep = () => setCurrentStep('scorer-select');
  const goToPrimaryAssistStep = () => setCurrentStep('primary-assist');
  const goToSecondaryAssistStep = () => setCurrentStep('secondary-assist');
  const goToPlayersOnIceStep = () => setCurrentStep('players-on-ice');
  const goToSubmitStep = () => setCurrentStep('submit');
  const goToOpponentGoalStep = () => setCurrentStep('opponent-goal');
  
  // For opponent goals, we may want to skip directly to the submit step
  // if we don't need to select players on ice
  const handleNextStep = () => {
    if (currentStep === 'players-on-ice') {
      goToSubmitStep();
    } else {
      goToSubmitStep();
    }
  };

  return {
    currentStep,
    isSubmitting,
    setIsSubmitting,
    goToScorerStep,
    goToPrimaryAssistStep,
    goToSecondaryAssistStep,
    goToPlayersOnIceStep,
    goToSubmitStep,
    goToOpponentGoalStep,
    handleNextStep
  };
}
