
import React from 'react';
import { Card } from '@/components/ui/card';
import { GoalHeader } from '../GoalHeader';
import { Game } from '@/types';
import { GoalStepNavigation } from './GoalStepNavigation';

interface GoalFlowLayoutProps {
  game: Game;
  selectedTeam: 'home' | 'away' | null;
  currentStep: string;
  isSubmitting: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}

export function GoalFlowLayout({
  game,
  selectedTeam,
  currentStep,
  isSubmitting,
  onCancel,
  children
}: GoalFlowLayoutProps) {
  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      {children}
      <GoalStepNavigation 
        currentStep={currentStep}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </Card>
  );
}
