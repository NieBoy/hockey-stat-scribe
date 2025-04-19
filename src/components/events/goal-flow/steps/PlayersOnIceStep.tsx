
import React from 'react';
import { Team, User } from '@/types';
import PlayerLines from '../../PlayerLines';

interface PlayersOnIceStepProps {
  team: Team;
  onPlayersSelect: (players: User[]) => void;
  preSelectedPlayers: User[];
  onComplete: () => void;
}

export function PlayersOnIceStep({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete
}: PlayersOnIceStepProps) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">Select players on ice (+/-)</h3>
        <p className="text-sm text-muted-foreground">
          Select all players on the ice at the time of the goal (max 6)
        </p>
      </div>
      <PlayerLines 
        team={team}
        onMultiPlayerSelect={onPlayersSelect}
        selectedPlayers={preSelectedPlayers}
        multiSelect={true}
        allowComplete={true}
        onComplete={onComplete}
        completeText="Confirm Players"
        maxSelections={6}
      />
    </div>
  );
}
