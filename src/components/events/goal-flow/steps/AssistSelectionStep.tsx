
import React from 'react';
import { Team, User } from '@/types';
import PlayerLines from '../../PlayerLines';

interface AssistSelectionStepProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedAssist: User | null;
  excludedPlayers: User[];
  isPrimary: boolean;
  onSkip: () => void;
}

export function AssistSelectionStep({
  team,
  onPlayerSelect,
  selectedAssist,
  excludedPlayers,
  isPrimary,
  onSkip
}: AssistSelectionStepProps) {
  // Filter out excluded players
  const eligiblePlayers = {
    ...team,
    players: team.players.filter(p => !excludedPlayers.some(excluded => excluded.id === p.id))
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">
          Who had the {isPrimary ? 'primary' : 'secondary'} assist?
        </h3>
      </div>
      <PlayerLines
        team={eligiblePlayers}
        onPlayerSelect={onPlayerSelect}
        selectedPlayers={selectedAssist ? [selectedAssist] : []}
        multiSelect={false}
        allowSkip={true}
        onSkip={onSkip}
        skipText={`Skip (No ${isPrimary ? '' : 'Second'} Assist)`}
      />
    </div>
  );
}
