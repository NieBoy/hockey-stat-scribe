import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game, User } from '@/types';
import { Button } from '@/components/ui/button';
import { TeamSelect } from './goal-flow/TeamSelect';
import { usePenaltyFlow, PenaltyType } from '@/hooks/usePenaltyFlow';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PlayerSelect } from './goal-flow/PlayerSelect';

const PENALTY_TYPES: PenaltyType[] = [
  'hooking',
  'tripping',
  'interference',
  'roughing',
  'slashing',
  'cross-checking',
  'high-sticking',
  'holding',
  'boarding',
  'charging'
];

interface PenaltyFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function PenaltyFlow({ game, period, onComplete, onCancel }: PenaltyFlowProps) {
  const {
    currentStep,
    selectedTeam,
    selectedPlayer,
    selectedPenaltyType,
    penaltyDuration,
    additionalPenalty,
    isSubmitting,
    handleTeamSelect,
    handlePlayerSelect,
    handlePenaltyTypeSelect,
    handlePenaltyDurationSelect,
    handleAdditionalPenaltySelect,
    handleSubmit
  } = usePenaltyFlow(game, period, onComplete);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelect game={game} onTeamSelect={handleTeamSelect} />;
        
      case 'player-select':
        if (!selectedTeam) return null;
        const team = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Penalized Player</h3>
            <PlayerSelect
              team={team}
              onPlayerSelect={handlePlayerSelect}
              selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
              title="Select Penalized Player"
              showLineups={true}
            />
          </div>
        );
        
      case 'penalty-type':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Penalty Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {PENALTY_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedPenaltyType === type ? "default" : "outline"}
                  onClick={() => handlePenaltyTypeSelect(type)}
                  className="capitalize"
                >
                  {type.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'penalty-duration':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Penalty Duration</h3>
            <RadioGroup
              defaultValue={penaltyDuration || undefined}
              onValueChange={(value) => handlePenaltyDurationSelect(value as 'minor' | 'major')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor" id="minor" />
                <Label htmlFor="minor">Minor (2 minutes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="major" id="major" />
                <Label htmlFor="major">Major (5 minutes)</Label>
              </div>
            </RadioGroup>
          </div>
        );
        
      case 'additional-penalty':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Penalty</h3>
            <RadioGroup
              defaultValue={additionalPenalty}
              onValueChange={(value) => handleAdditionalPenaltySelect(value as 'none' | 'match' | 'game-misconduct')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="match" id="match" />
                <Label htmlFor="match">Match Penalty</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="game-misconduct" id="game-misconduct" />
                <Label htmlFor="game-misconduct">Game Misconduct</Label>
              </div>
            </RadioGroup>
          </div>
        );
        
      case 'submit':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Confirm Penalty</h3>
            <div className="space-y-2">
              <p>Player: {selectedPlayer?.name}</p>
              <p className="capitalize">Penalty: {selectedPenaltyType?.replace('-', ' ')}</p>
              <p>Duration: {penaltyDuration === 'minor' ? '2 minutes' : '5 minutes'}</p>
              {additionalPenalty !== 'none' && (
                <p className="capitalize">Additional: {additionalPenalty.replace('-', ' ')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Confirm Penalty'}
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
