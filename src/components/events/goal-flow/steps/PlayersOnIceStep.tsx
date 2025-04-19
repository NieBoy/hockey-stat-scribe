
import React, { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';

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
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>(preSelectedPlayers);

  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      setSelectedPlayers([...new Map(preSelectedPlayers.map(p => [p.id, p])).values()]);
    }
  }, [preSelectedPlayers]);

  const handlePlayerSelect = (player: User) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    let newSelection: User[];
    
    if (isSelected) {
      newSelection = selectedPlayers.filter(p => p.id !== player.id);
    } else {
      if (selectedPlayers.length >= 6) {
        return; // Maximum players reached
      }
      newSelection = [...selectedPlayers, player];
    }
    
    setSelectedPlayers(newSelection);
    onPlayersSelect(newSelection);
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">Select players on ice (+/-)</h3>
        <p className="text-sm text-muted-foreground">
          Select all players on the ice at the time of the goal (max 6)
        </p>
        
        <div className="mt-3 mb-4">
          <p className="text-sm font-medium">
            Selected: {selectedPlayers.length}/6 players
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <SimplePlayerList
            players={team.players}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={selectedPlayers}
          />
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={onComplete}
              disabled={selectedPlayers.length === 0}
            >
              Confirm Players
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
