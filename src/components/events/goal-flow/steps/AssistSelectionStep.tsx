
import React from 'react';
import { Team, User, Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { convertPlayersToUsers } from '@/utils/typeConversions';

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
  // Convert players to User type if needed
  const getPlayers = (): User[] => {
    if (!team.players) return [];
    
    // Check if players are already User type or need conversion
    if (team.players.length > 0 && 'email' in team.players[0]) {
      return team.players as User[];
    } else {
      return convertPlayersToUsers(team.players as Player[]);
    }
  };

  // Get and filter players
  const allPlayers = getPlayers();
  const eligiblePlayers = allPlayers.filter(
    p => !excludedPlayers.some(excluded => excluded.id === p.id)
  );

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
            players={eligiblePlayers}
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
