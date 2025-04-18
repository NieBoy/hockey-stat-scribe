
import React from 'react';
import { Game } from '@/types';
import { TeamOptions } from './team-selection/TeamOptions';

interface TeamSelectProps {
  game: Game;
  onTeamSelect: (team: 'home' | 'away') => void;
}

export function TeamSelect({ game, onTeamSelect }: TeamSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Which team scored?</h3>
      <TeamOptions game={game} onTeamSelect={onTeamSelect} />
    </div>
  );
}
