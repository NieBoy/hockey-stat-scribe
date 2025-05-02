
import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { toast } from 'sonner';

interface MandatoryPlayersStepProps {
  mandatoryPlayers: User[];
  isOpponentTeam: boolean;
  onContinue: () => void;
}

export function MandatoryPlayersStep({
  mandatoryPlayers,
  isOpponentTeam,
  onContinue
}: MandatoryPlayersStepProps) {
  return (
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
          onClick={onContinue}
          disabled={!isOpponentTeam && mandatoryPlayers.length === 0}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
