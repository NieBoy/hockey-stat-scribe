
import { useState } from 'react';

type FlowStep = 'team-select' | 'scorer-select' | 'primary-assist' | 'secondary-assist' | 'players-on-ice' | 'submit';

export function useFlowNavigation() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const goToScorerStep = () => setCurrentStep('scorer-select');
  const goToPrimaryAssistStep = () => setCurrentStep('primary-assist');
  const goToSecondaryAssistStep = () => setCurrentStep('secondary-assist');
  const goToPlayersOnIceStep = () => setCurrentStep('players-on-ice');
  const goToSubmitStep = () => setCurrentStep('submit');

  return {
    currentStep,
    isSubmitting,
    setIsSubmitting,
    goToScorerStep,
    goToPrimaryAssistStep,
    goToSecondaryAssistStep,
    goToPlayersOnIceStep,
    goToSubmitStep,
    handleNextStep: goToSubmitStep
  };
}
