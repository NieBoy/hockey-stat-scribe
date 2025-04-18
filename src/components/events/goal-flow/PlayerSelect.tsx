
import React from 'react';
import { Team, User } from '@/types';
import PlayerLines from '@/components/events/PlayerLines';

interface PlayerSelectProps {
  team: Team;
  title: string;
  onPlayerSelect: (player: User | null) => void;
  selectedPlayers: User[];
  allowSkip?: boolean;
  skipText?: string;
}

export function PlayerSelect({
  team,
  title,
  onPlayerSelect,
  selectedPlayers,
  allowSkip,
  skipText
}: PlayerSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <PlayerLines 
        team={team}
        onPlayerSelect={onPlayerSelect}
        selectedPlayers={selectedPlayers}
        allowSkip={allowSkip}
        onSkip={() => onPlayerSelect(null)}
        skipText={skipText}
      />
    </div>
  );
}
