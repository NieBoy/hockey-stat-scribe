
import React from 'react';
import { Game } from '@/types';
import { TeamSelect } from '../TeamSelect';

interface TeamSelectionStepProps {
  game: Game;
  onTeamSelect: (team: 'home' | 'away') => void;
}

export function TeamSelectionStep({ game, onTeamSelect }: TeamSelectionStepProps) {
  return <TeamSelect game={game} onTeamSelect={onTeamSelect} />;
}
