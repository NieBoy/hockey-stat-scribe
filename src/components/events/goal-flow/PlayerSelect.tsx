
import React from 'react';
import { Team, User } from '@/types';
import { PlayerList } from './player-selection/PlayerList';
import { SkipButton } from './player-selection/SkipButton';

interface PlayerSelectProps {
  team: Team;
  title: string;
  onPlayerSelect: (player: User | null) => void;
  selectedPlayers: User[];
  allowSkip?: boolean;
  skipText?: string;
  showLineups?: boolean;
}

export function PlayerSelect({
  team,
  title,
  onPlayerSelect,
  selectedPlayers,
  allowSkip,
  skipText,
  showLineups = false
}: PlayerSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <PlayerList 
        team={team}
        onPlayerSelect={onPlayerSelect}
        selectedPlayers={selectedPlayers}
      />
      {allowSkip && (
        <SkipButton 
          onSkip={() => onPlayerSelect(null)} 
          text={skipText}
        />
      )}
    </div>
  );
}
