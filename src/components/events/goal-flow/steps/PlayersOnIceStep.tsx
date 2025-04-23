import React, { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { toast } from 'sonner';

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
  // Always store the list as User[] to keep selection logic compatible
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);

  // Initialize with preselected players when the component mounts or preSelectedPlayers changes
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      // Make unique list by player id
      const validPlayers = preSelectedPlayers
        .filter(Boolean)
        .map(player => ({
          id: player.id,
          name: player.name,
          number: player.number || '',
        } as User));
      const uniquePlayers = Array.from(new Map(validPlayers.map(p => [p.id, p])).values());
      setSelectedPlayers(uniquePlayers);
      setMandatoryPlayers(uniquePlayers);
      // Also report to parent immediately with initial selection
      onPlayersSelect(uniquePlayers);
    }
  }, [preSelectedPlayers, onPlayersSelect]);

  // Allow multi-select: add or remove players from selectedPlayers
  const handlePlayerSelect = (player: User) => {
    const isAlreadySelected = selectedPlayers.some(p => p.id === player.id);
    const isMandatory = mandatoryPlayers.some(p => p.id === player.id);

    // Don't allow removing mandatory players (scorer/assists)
    if (isAlreadySelected && isMandatory) {
      toast(`${player.name} cannot be deselected`);
      return;
    }

    let updatedSelection: User[];
    if (isAlreadySelected) {
      // Remove player if not mandatory
      updatedSelection = selectedPlayers.filter(p => p.id !== player.id);
    } else {
      // Add player if under limit
      if (selectedPlayers.length >= 6) {
        toast("Maximum of 6 players allowed on ice");
        return;
      }
      updatedSelection = [...selectedPlayers, player];
    }

    setSelectedPlayers(updatedSelection);
    onPlayersSelect(updatedSelection);
  };

  // Confirm selection (used by Confirm button)
  const handleConfirm = () => {
    if (selectedPlayers.length === 0) {
      toast("Please select at least one player");
      return;
    }

    // Ensure all mandatory players are included
    const withAllMandatory = [...selectedPlayers];
    for (const mandatory of mandatoryPlayers) {
      if (!withAllMandatory.some(p => p.id === mandatory.id)) {
        withAllMandatory.push(mandatory);
      }
    }

    // Limit to 6
    const finalPlayers = withAllMandatory.slice(0, 6);

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
          </p>
          {mandatoryPlayers.length > 0 && (
            <p className="text-xs text-amber-600">
              Players involved in the goal (scorer/assists) are automatically included and cannot be deselected
            </p>
          )}
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          {team.players && team.players.length > 0 ? (
            <>
              <SimplePlayerList
                players={team.players as User[]}
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
            </>
          ) : (
            <p>No players available for selection</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
