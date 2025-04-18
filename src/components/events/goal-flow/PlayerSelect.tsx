
import React from 'react';
import { Team, User } from '@/types';
import { SimplePlayerLinesView } from '../player-lines/SimplePlayerLinesView';
import { Button } from '@/components/ui/button';

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
      <SimplePlayerLinesView 
        team={team}
        onPlayerSelect={onPlayerSelect}
        selectedPlayers={selectedPlayers}
      />
      {allowSkip && (
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={() => onPlayerSelect(null)}>
            {skipText || "Skip"}
          </Button>
        </div>
      )}
    </div>
  );
}
