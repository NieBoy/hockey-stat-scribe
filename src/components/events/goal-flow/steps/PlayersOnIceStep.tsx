
import React, { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import PlayerLines from '../../PlayerLines';
import { Button } from '@/components/ui/button';

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
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>(preSelectedPlayers || []);
  
  // Update local state when preSelectedPlayers changes
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      setSelectedPlayers(preSelectedPlayers);
    }
  }, [preSelectedPlayers]);
  
  const handlePlayersSelect = (players: User[]) => {
    console.log("PlayersOnIceStep - Selected players:", players);
    setSelectedPlayers(players);
    onPlayersSelect(players);
  };
  
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">Select players on ice (+/-)</h3>
        <p className="text-sm text-muted-foreground">
          Select all players on the ice at the time of the goal (max 6)
        </p>
        
        <div className="mt-3 mb-4">
          <p className="text-sm font-medium">Selected: {selectedPlayers.length}/6 players</p>
        </div>
      </div>
      
      <PlayerLines 
        team={team}
        onMultiPlayerSelect={handlePlayersSelect}
        selectedPlayers={selectedPlayers}
        multiSelect={true}
        allowComplete={true}
        onComplete={onComplete}
        completeText="Confirm Players"
        maxSelections={6}
        forceRefresh={true}
      />
    </div>
  );
}
