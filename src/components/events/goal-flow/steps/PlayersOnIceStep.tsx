
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
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [forceRefreshKey, setForceRefreshKey] = useState<number>(0);
  
  // Initialize with preSelectedPlayers when the component mounts or when they change
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      const uniquePlayers = [...new Map(preSelectedPlayers.map(p => [p.id, p])).values()];
      setSelectedPlayers(uniquePlayers);
      // Force a refresh to ensure PlayerLines re-renders with correct selection
      setForceRefreshKey(prev => prev + 1);
    }
  }, [preSelectedPlayers]);
  
  const handlePlayersSelect = (players: User[]) => {
    console.log("PlayersOnIceStep - Selected players:", players);
    
    // Make sure we have a clean array with no duplicates
    const uniquePlayers = [...new Map(players.map(p => [p.id, p])).values()];
    setSelectedPlayers(uniquePlayers);
    onPlayersSelect(uniquePlayers);
  };

  const handleComplete = () => {
    // Make final check that we don't exceed the limit
    const finalPlayers = selectedPlayers.slice(0, 6);
    onPlayersSelect(finalPlayers);
    onComplete();
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
            {selectedPlayers.length > 6 && (
              <span className="text-red-500 ml-2">(Only first 6 will be used)</span>
            )}
          </p>
        </div>
      </div>
      
      <PlayerLines 
        key={`player-lines-${forceRefreshKey}`}
        team={team}
        onMultiPlayerSelect={handlePlayersSelect}
        selectedPlayers={selectedPlayers}
        multiSelect={true}
        maxSelections={6}
        forceRefresh={forceRefreshKey > 0}
        allowComplete={true}
        onComplete={handleComplete}
        completeText="Confirm Players"
      />
    </div>
  );
}
