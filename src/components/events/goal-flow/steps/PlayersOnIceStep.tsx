
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
  // Make sure preSelectedPlayers are always in selection and can't be removed
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);

  // Initialize mandatory and selected players (mandatory + extras) ONCE on mount
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      // Uniqueness by ID
      const uniqueMandatory = Array.from(
        new Map(preSelectedPlayers.filter(Boolean).map(p => [p.id, p])).values()
      );
      setMandatoryPlayers(uniqueMandatory);
      setSelectedPlayers(uniqueMandatory); // Start only with mandatory, user picks extras
      onPlayersSelect(uniqueMandatory); // Notify parent initially
    } else {
      setMandatoryPlayers([]);
      setSelectedPlayers([]);
      onPlayersSelect([]); // No default selection
    }
    // Only want to set this ONCE on mount or when preSelectedPlayers changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedPlayers]);

  // Update parent whenever selection changes
  useEffect(() => {
    onPlayersSelect(selectedPlayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers]);

  // Player select/deselect
  const handlePlayerSelect = (player: User) => {
    const isMandatory = mandatoryPlayers.some(p => p.id === player.id);
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    // Can't remove mandatory players
    if (isMandatory && isSelected) {
      toast(`${player.name} cannot be deselected (involved in the goal)`);
      return;
    }

    // Add extra player if not full and not already selected
    if (!isSelected) {
      if (selectedPlayers.length >= 6) {
        toast("Maximum of 6 players allowed on ice");
        return;
      }
      setSelectedPlayers([...selectedPlayers, player]);
      return;
    }

    // Remove extra players (never mandatory)
    if (!isMandatory && isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    }
  };

  const handleConfirm = () => {
    if (selectedPlayers.length < mandatoryPlayers.length) {
      toast("All goal-involved players must be included");
      return;
    }
    if (selectedPlayers.length === 0) {
      toast("Please select at least one player");
      return;
    }
    if (selectedPlayers.length > 6) {
      toast("Impossible state: more than 6 players selected!");
      return;
    }
    onPlayersSelect(selectedPlayers);
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
                  disabled={selectedPlayers.length < mandatoryPlayers.length}
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

