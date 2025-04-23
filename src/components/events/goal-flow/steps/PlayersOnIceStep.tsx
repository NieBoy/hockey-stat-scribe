
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

type SubStep = "mandatory" | "extras";

export function PlayersOnIceStep({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete
}: PlayersOnIceStepProps) {
  // Split the process into 2 UI steps
  const [subStep, setSubStep] = useState<SubStep>("mandatory");
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);

  // Initialize mandatory and selected players ONCE on mount
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      const uniqueMandatory = Array.from(
        new Map(preSelectedPlayers.filter(Boolean).map(p => [p.id, p])).values()
      );
      setMandatoryPlayers(uniqueMandatory);
      setSelectedPlayers(uniqueMandatory);
      onPlayersSelect(uniqueMandatory); // still notify on mount
    } else {
      setMandatoryPlayers([]);
      setSelectedPlayers([]);
      onPlayersSelect([]);
    }
    setSubStep("mandatory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedPlayers]);

  // Player selection logic for extras (cannot remove mandatory)
  const handleExtraPlayerToggle = (player: User) => {
    const isMandatory = mandatoryPlayers.some(p => p.id === player.id);
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (isMandatory) {
      toast(`${player.name} is already included due to goal involvement.`);
      return;
    }

    if (!isSelected) {
      if (selectedPlayers.length >= 6) {
        toast("Maximum of 6 players allowed on ice");
        return;
      }
      setSelectedPlayers([...selectedPlayers, player]);
      return;
    }

    // Remove extra player
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    }
  };

  // Navigation handlers for new step structure
  const handleContinueMandatory = () => {
    setSubStep("extras");
  };

  const handleBackToMandatory = () => {
    setSubStep("mandatory");
  };

  // Confirm selection and complete
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

  // Automatically notify parent of changes
  useEffect(() => {
    onPlayersSelect(selectedPlayers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers]);

  return (
    <div>
      {subStep === "mandatory" && (
        <>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Review Goal-Involved Players</h3>
            <p className="text-sm text-muted-foreground">
              These players are involved in the goal (scorer/assists) and are required on the ice.
            </p>
          </div>
          <Card>
            <CardContent className="p-4">
              {mandatoryPlayers.length > 0 ? (
                <SimplePlayerList
                  players={mandatoryPlayers}
                  selectedPlayers={mandatoryPlayers}
                />
              ) : (
                <p>No goal-involved players. Please select at least one on the previous step.</p>
              )}
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleContinueMandatory}
              disabled={mandatoryPlayers.length === 0}
            >
              Continue
            </Button>
          </div>
        </>
      )}

      {subStep === "extras" && (
        <>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Select Additional Players on Ice</h3>
            <p className="text-sm text-muted-foreground">
              Add up to {6 - mandatoryPlayers.length} extra players on the ice (max 6 total with required).
            </p>
            <div className="mt-3 mb-4">
              <p className="text-sm font-medium">
                Selected: {selectedPlayers.length}/6 players
              </p>
              <p className="text-xs text-amber-600">
                Players involved in the goal (scorer/assists) are already included and cannot be removed.
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              {team.players && team.players.length > 0 ? (
                <>
                  <SimplePlayerList
                    players={team.players as User[]}
                    onPlayerSelect={handleExtraPlayerToggle}
                    selectedPlayers={selectedPlayers}
                  />
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="ghost"
                      onClick={handleBackToMandatory}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirm}
                      disabled={selectedPlayers.length < mandatoryPlayers.length || selectedPlayers.length === 0}
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
        </>
      )}
    </div>
  );
}
