
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { useShotsFlow } from '@/hooks/useShotsFlow';
import { PlayerSelect } from './goal-flow/PlayerSelect';
import { ensureTeamCompatibility } from '@/utils/typeConversions';

interface ShotsFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ShotsFlow({ game, period, onComplete, onCancel }: ShotsFlowProps) {
  const {
    currentStep,
    selectedTeam,
    selectedPlayer,
    isForUs,
    isSubmitting,
    handleTeamSelect,
    handlePlayerSelect,
    handleSubmit
  } = useShotsFlow(game, period, onComplete);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shot Direction</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleTeamSelect(true)}
                className="w-full"
              >
                For Us
              </Button>
              <Button 
                onClick={() => handleTeamSelect(false)}
                className="w-full"
              >
                Against Us
              </Button>
            </div>
          </div>
        );

      case 'player-select':
        if (!selectedTeam) return null;
        const teamDetails = isForUs ? game.homeTeam : game.awayTeam;
        const team = ensureTeamCompatibility(teamDetails);
        
        const title = isForUs ? "Select Player Who Took Shot" : "Select Goalie";
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <PlayerSelect
              team={team}
              onPlayerSelect={handlePlayerSelect}
              selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
              title={title}
              showLineups={true}
            />
          </div>
        );

      case 'submit':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm Shot</h3>
            <div className="space-y-2">
              <p>Player: {selectedPlayer?.name}</p>
              <p>Type: {isForUs ? 'Shot For' : 'Shot Against'}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Confirm Shot'}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {renderStepContent()}
        {currentStep !== 'submit' && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
