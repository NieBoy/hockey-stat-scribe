
import React from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';

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
      
      <Card>
        <CardContent className="p-4">
          <SimplePlayerList
            players={eligiblePlayers.players}
            onPlayerSelect={onPlayerSelect}
            selectedPlayers={selectedAssist ? [selectedAssist] : []}
          />
          
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={onSkip}>
              Skip (No {isPrimary ? '' : 'Second'} Assist)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
