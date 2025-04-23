
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game, User } from '@/types';
import { GoalHeader } from './goal-flow/GoalHeader';
import { GoalActions } from './goal-flow/GoalActions';
import { useGoalFlow } from '@/hooks/useGoalFlow';
import { TeamSelectionStep } from './goal-flow/steps/TeamSelectionStep';
import { ScorerSelectionStep } from './goal-flow/steps/ScorerSelectionStep';
import { AssistSelectionStep } from './goal-flow/steps/AssistSelectionStep';
import { PlayersOnIceStep } from './goal-flow/steps/PlayersOnIceStep';
import { GoalSummaryStep } from './goal-flow/steps/GoalSummaryStep';

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
    handleNextStep,
    handleSubmit
  } = useGoalFlow(game, period, onComplete);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelectionStep game={game} onTeamSelect={handleTeamSelect} />;
      case 'scorer-select':
        if (!selectedTeam) return null;
        const teamData = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        return (
          <ScorerSelectionStep
            team={teamData}
            onPlayerSelect={handleScorerSelect}
            selectedScorer={selectedScorer}
            isLoadingLineups={false}
            onRefreshLineups={() => {}}
          />
        );
      case 'primary-assist':
        if (!selectedTeam) return null;
        return (
          <AssistSelectionStep
            team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
            onPlayerSelect={handlePrimaryAssistSelect}
            selectedAssist={primaryAssist}
            excludedPlayers={[selectedScorer].filter(Boolean) as User[]}
            isPrimary={true}
            onSkip={() => handlePrimaryAssistSelect(null)}
          />
        );
      case 'secondary-assist':
        if (!selectedTeam) return null;
        return (
          <AssistSelectionStep
            team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
            onPlayerSelect={handleSecondaryAssistSelect}
            selectedAssist={secondaryAssist}
            excludedPlayers={[selectedScorer, primaryAssist].filter(Boolean) as User[]}
            isPrimary={false}
            onSkip={() => handleSecondaryAssistSelect(null)}
          />
        );
      case 'players-on-ice':
        if (!selectedTeam) return null;
        return (
          <PlayersOnIceStep
            team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
            onPlayersSelect={handlePlayersOnIceSelect}
            preSelectedPlayers={[selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[]}
            onComplete={handleNextStep}
          />
        );
      case 'submit':
        return (
          <GoalSummaryStep
            game={game}
            selectedScorer={selectedScorer}
            primaryAssist={primaryAssist}
            secondaryAssist={secondaryAssist}
            period={period}
            playersOnIce={playersOnIce}
            isSubmitting={isSubmitting}
            onCancel={onCancel}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      <CardContent>
        {renderStepContent()}
        {currentStep !== 'submit' && currentStep !== 'players-on-ice' && (
          <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />
        )}
      </CardContent>
    </Card>
  );
}
