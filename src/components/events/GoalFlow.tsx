
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGoalFlow } from '@/hooks/useGoalFlow';
import { TeamSelect } from './goal-flow/TeamSelect';
import { PlayerSelect } from './goal-flow/PlayerSelect';
import PlayerLines from './PlayerLines';

interface GoalFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function GoalFlow({ game, period, onComplete, onCancel }: GoalFlowProps) {
  const {
    currentStep,
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isSubmitting,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleSubmit
  } = useGoalFlow(game, period, onComplete);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelect game={game} onTeamSelect={handleTeamSelect} />;

      case 'scorer-select':
        return (
          <PlayerSelect
            team={game.homeTeam}
            title="Who scored the goal?"
            onPlayerSelect={handleScorerSelect}
            selectedPlayers={[]}
          />
        );

      case 'primary-assist':
        return (
          <PlayerSelect
            team={game.homeTeam}
            title="Primary assist (if any)"
            onPlayerSelect={handlePrimaryAssistSelect}
            selectedPlayers={[selectedScorer!]}
            allowSkip
            skipText="No assists"
          />
        );

      case 'secondary-assist':
        return (
          <PlayerSelect
            team={game.homeTeam}
            title="Secondary assist (if any)"
            onPlayerSelect={handleSecondaryAssistSelect}
            selectedPlayers={[selectedScorer!, ...(primaryAssist ? [primaryAssist] : [])]}
            allowSkip
            skipText="No secondary assist"
          />
        );

      case 'players-on-ice':
      case 'opponent-players-on-ice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {currentStep === 'players-on-ice' 
                ? "Who else was on the ice?"
                : `Who was on the ice for ${game.homeTeam.name}?`}
            </h3>
            <p className="text-muted-foreground text-sm">
              Select up to {6 - playersOnIce.length} more players (already selected: {playersOnIce.length})
            </p>
            <PlayerLines 
              team={game.homeTeam}
              onMultiPlayerSelect={handlePlayersOnIceSelect}
              selectedPlayers={playersOnIce}
              multiSelect
              allowComplete
              onComplete={handleSubmit}
              completeText={currentStep === 'players-on-ice' ? "Record Goal" : "Record Goal Against"}
              maxSelections={6}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedTeam === 'home' 
            ? `${game.homeTeam.name} Goal` 
            : selectedTeam === 'away' 
              ? `${game.awayTeam.name} Goal` 
              : 'Record Goal'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
