
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
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>(preSelectedPlayers || []);
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>(preSelectedPlayers || []);
  
  // Ensure we're working with a deduplicated list of preselected players
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      // Remove duplicates by creating a map keyed by player ID
      const uniquePlayers = [...new Map(preSelectedPlayers
        .filter(p => p) // Filter out null/undefined players
        .map(p => [p.id, p])
      ).values()];
      
      setSelectedPlayers(uniquePlayers);
      setMandatoryPlayers(uniquePlayers);
    }
  }, [preSelectedPlayers]);

  const handlePlayerSelect = (player: User) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    let newSelection: User[];
    
    if (isSelected) {
      // Don't allow deselection of mandatory players (scorer & assists)
      if (mandatoryPlayers.some(p => p.id === player.id)) {
        return;
      }
      newSelection = selectedPlayers.filter(p => p.id !== player.id);
    } else {
      // Maximum 6 players on ice
      if (selectedPlayers.length >= 6) {
        return;
      }
      newSelection = [...selectedPlayers, player];
    }
    
    setSelectedPlayers(newSelection);
    onPlayersSelect(newSelection);
  };

  const handleConfirm = () => {
    // Make sure we have at least the mandatory players
    if (selectedPlayers.length === 0) {
      return;
    }
    
    // Make sure mandatory players are included
    const finalSelection = [...selectedPlayers];
    mandatoryPlayers.forEach(mandatory => {
      if (!finalSelection.some(p => p.id === mandatory.id)) {
        finalSelection.push(mandatory);
      }
    });
    
    // Limit to 6 players maximum
    const limitedSelection = finalSelection.slice(0, 6);
    
    onPlayersSelect(limitedSelection);
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
              onClick={handleConfirm}
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
