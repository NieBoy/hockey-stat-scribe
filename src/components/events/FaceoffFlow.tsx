
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game, User } from '@/types';
import { Button } from '@/components/ui/button';
import { useFaceoffFlow } from '@/hooks/useFaceoffFlow';
import { PlayerSelect } from './goal-flow/PlayerSelect';
import { ensureTeamCompatibility } from '@/utils/typeConversions';

interface FaceoffFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function FaceoffFlow({ game, period, onComplete, onCancel }: FaceoffFlowProps) {
  const {
    currentStep,
    selectedTeam,
    selectedPlayer,
    isWon,
    isSubmitting,
    handleWinSelect,
    handleLossSelect,
    handlePlayerSelect,
    handleSubmit
  } = useFaceoffFlow(game, period, onComplete);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'outcome-select':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Faceoff Outcome</h3>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleWinSelect('home')} 
                className="flex-1"
              >
                Home Team Win
              </Button>
              <Button 
                onClick={() => handleLossSelect('away')} 
                className="flex-1"
              >
                Away Team Win
              </Button>
            </div>
          </div>
        );

      case 'player-select':
        if (!selectedTeam) return null;
        const teamDetails = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        const team = ensureTeamCompatibility(teamDetails);
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Select {isWon ? 'Winning' : 'Losing'} Player
            </h3>
            <PlayerSelect
              team={team}
              onPlayerSelect={handlePlayerSelect}
              selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
              title={`Select ${isWon ? 'Winning' : 'Losing'} Player`}
              showLineups={true}
            />
          </div>
        );

      case 'submit':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm Faceoff</h3>
            <div className="space-y-2">
              <p>Player: {selectedPlayer?.name}</p>
              <p>Outcome: {isWon ? 'Won' : 'Lost'} Faceoff</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Confirm Faceoff'}
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
