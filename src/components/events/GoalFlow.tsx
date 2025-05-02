
import React from 'react';
import { Game } from '@/types';
import GoalFlowContainer from './goal-flow/GoalFlowContainer';

interface GoalFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function GoalFlow({ game, period, onComplete, onCancel }: GoalFlowProps) {
  return (
    <GoalFlowContainer 
      game={game}
      period={period}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
}
