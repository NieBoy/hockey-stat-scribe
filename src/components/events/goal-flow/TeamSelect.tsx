
import React from 'react';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';

interface TeamSelectProps {
  game: Game;
  onTeamSelect: (team: 'home' | 'away') => void;
}

export function TeamSelect({ game, onTeamSelect }: TeamSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Which team scored?</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Button 
          onClick={() => onTeamSelect('home')}
          className="h-20 text-xl"
          variant="outline"
        >
          {game.homeTeam.name}
        </Button>
        <Button 
          onClick={() => onTeamSelect('away')}
          className="h-20 text-xl"
          variant="outline"
        >
          {game.awayTeam.name}
        </Button>
      </div>
    </div>
  );
}
