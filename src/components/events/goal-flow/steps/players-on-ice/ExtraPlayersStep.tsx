
import React from 'react';
import { User, Team, Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { toast } from 'sonner';
import { convertPlayersToUsers } from '@/utils/typeConversions';

interface ExtraPlayersStepProps {
  team: Team;
  selectedPlayers: User[];
  mandatoryPlayers: User[];
  isOpponentTeam: boolean;
  onPlayerToggle: (player: User) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function ExtraPlayersStep({
  team,
  selectedPlayers,
  mandatoryPlayers,
  isOpponentTeam,
  onPlayerToggle,
  onBack,
  onConfirm
}: ExtraPlayersStepProps) {
  
  const handleExtraPlayerToggle = (player: User) => {
    const isMandatory = mandatoryPlayers.some(p => p.id === player.id);
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (isMandatory) {
      toast(`${player.name} is already included due to goal involvement.`);
      return;
    }

    if (!isSelected && selectedPlayers.length >= 6) {
      toast("Maximum of 6 players allowed on ice");
      return;
    }
    
    onPlayerToggle(player);
  };

  // Convert players array to User array for SimplePlayerList
  const getPlayersList = (): User[] => {
    if (!team.players) return [];
    
    // Check if players are already User type or need conversion
    if (team.players.length > 0 && 'email' in team.players[0]) {
      return team.players as User[];
    } else {
      return convertPlayersToUsers(team.players as Player[]);
    }
  };
  
  const playersList = getPlayersList();

  return (
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
          {playersList.length > 0 ? (
            <>
              <SimplePlayerList
                players={playersList}
                onPlayerSelect={handleExtraPlayerToggle}
                selectedPlayers={selectedPlayers}
              />
              <div className="mt-4 flex justify-between">
                {!isOpponentTeam && (
                  <Button 
                    variant="ghost"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                )}
                <div className={isOpponentTeam ? "w-full flex justify-end" : ""}>
                  <Button 
                    onClick={onConfirm}
                  >
                    {isOpponentTeam ? "Confirm Players" : "Continue"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="mb-4">No players available for selection</p>
              <Button 
                onClick={onConfirm}
                variant="outline"
              >
                Continue Without Players
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
