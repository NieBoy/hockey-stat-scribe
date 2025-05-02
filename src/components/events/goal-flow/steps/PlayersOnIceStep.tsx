
import React, { useState, useEffect, useRef } from 'react';
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
  isOpponentTeam?: boolean;
}

type SubStep = "mandatory" | "extras";

export function PlayersOnIceStep({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete,
  isOpponentTeam = false
}: PlayersOnIceStepProps) {
  // Split the process into 2 UI steps
  const [subStep, setSubStep] = useState<SubStep>("mandatory");
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);

  // Flag tracks first mount/init to avoid bouncing UI
  const initialized = useRef(false);
  const prevIdsRef = useRef<string>('');

  // Only initialize ONCE for given preSelectedPlayers by shallow ID comparison
  useEffect(() => {
    // Convert preSelectedPlayers to IDs for comparison
    const newIdList = preSelectedPlayers.map(player => player.id).join(',');
    
    // Track when preSelectedPlayers actually change
    if (!initialized.current || newIdList !== prevIdsRef.current) {
      const uniqueMandatory = Array.from(
        new Map(preSelectedPlayers.filter(Boolean).map(p => [p.id, p])).values()
      );
      setMandatoryPlayers(uniqueMandatory);
      setSelectedPlayers(uniqueMandatory);
      onPlayersSelect(uniqueMandatory);
      setSubStep("mandatory");
      initialized.current = true;
      prevIdsRef.current = newIdList;
    }
  }, [preSelectedPlayers, onPlayersSelect]);
  
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
    // For opponent goals, we don't require any players to be selected,
    // but we still need to have valid players if any are selected
    if (!isOpponentTeam) {
      if (selectedPlayers.length < mandatoryPlayers.length) {
        toast("All goal-involved players must be included");
        return;
      }
      if (selectedPlayers.length === 0) {
        toast("Please select at least one player");
        return;
      }
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
              {isOpponentTeam 
                ? "Select home team players on the ice for plus/minus calculation."
                : "These players are involved in the goal (scorer/assists) and are required on the ice."}
            </p>
          </div>
          <Card>
            <CardContent className="p-4">
              {!isOpponentTeam && mandatoryPlayers.length > 0 ? (
                <SimplePlayerList
                  players={mandatoryPlayers}
                  selectedPlayers={mandatoryPlayers}
                />
              ) : isOpponentTeam ? (
                <div className="p-2">
                  <p>Select which home team players were on the ice when the opponent scored.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    These players will receive a minus in their plus/minus stats.
                  </p>
                </div>
              ) : (
                <p>No goal-involved players. Please select at least one on the previous step.</p>
              )}
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleContinueMandatory}
              disabled={!isOpponentTeam && mandatoryPlayers.length === 0}
            >
              Continue
            </Button>
          </div>
        </>
      )}

      {subStep === "extras" && (
        <>
          <div className="mb-3">
            <h3 className="text-lg font-medium">
              {isOpponentTeam 
                ? "Select Home Team Players on Ice" 
                : "Select Additional Players on Ice"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isOpponentTeam 
                ? "Select which players were on the ice when the opponent scored (up to 6 players)." 
                : `Add up to ${6 - mandatoryPlayers.length} extra players on the ice (max 6 total with required).`}
            </p>
            <div className="mt-3 mb-4">
              <p className="text-sm font-medium">
                Selected: {selectedPlayers.length}/6 players
              </p>
              {!isOpponentTeam && (
                <p className="text-xs text-amber-600">
                  Players involved in the goal (scorer/assists) are already included and cannot be removed.
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
                      disabled={!isOpponentTeam && (selectedPlayers.length < mandatoryPlayers.length || selectedPlayers.length === 0)}
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
