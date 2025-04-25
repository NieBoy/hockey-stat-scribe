
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game } from '@/types';
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
    isLoadingLineups,
    hasLoadedLineups,
    handleRefreshLineups,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleNextStep,
    handleSubmit
  } = useGoalFlow(game, period, onComplete);

  // Ensure we have valid team data
  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelectionStep game={game} onTeamSelect={handleTeamSelect} />;
      case 'scorer-select':
        if (!selectedTeam) return null;
        
        // Get the appropriate team based on the selection
        const teamData = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        
        // Ensure teamData exists before passing it
        if (!teamData) {
          return (
            <div className="text-center text-red-500 py-4">
              <p>Error: Team data not found.</p>
              <p className="text-sm">Please go back and try again.</p>
            </div>
          );
        }
        
        return (
          <ScorerSelectionStep
            team={teamData}
            onPlayerSelect={handleScorerSelect}
            selectedScorer={selectedScorer}
            isLoadingLineups={isLoadingLineups}
            onRefreshLineups={handleRefreshLineups}
          />
        );
      case 'primary-assist':
        if (!selectedTeam) return null;
        const assistTeam = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        
        if (!assistTeam) {
          return (
            <div className="text-center text-red-500 py-4">
              <p>Error: Team data not found.</p>
              <p className="text-sm">Please go back and try again.</p>
            </div>
          );
        }
        
        return (
          <AssistSelectionStep
            team={assistTeam}
            onPlayerSelect={handlePrimaryAssistSelect}
            selectedAssist={primaryAssist}
            excludedPlayers={[selectedScorer].filter(Boolean)}
            isPrimary={true}
            onSkip={() => handlePrimaryAssistSelect(null)}
          />
        );
      case 'secondary-assist':
        if (!selectedTeam) return null;
        const secondaryAssistTeam = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        
        if (!secondaryAssistTeam) {
          return (
            <div className="text-center text-red-500 py-4">
              <p>Error: Team data not found.</p>
              <p className="text-sm">Please go back and try again.</p>
            </div>
          );
        }
        
        return (
          <AssistSelectionStep
            team={secondaryAssistTeam}
            onPlayerSelect={handleSecondaryAssistSelect}
            selectedAssist={secondaryAssist}
            excludedPlayers={[selectedScorer, primaryAssist].filter(Boolean)}
            isPrimary={false}
            onSkip={() => handleSecondaryAssistSelect(null)}
          />
        );
      case 'players-on-ice':
        if (!selectedTeam) return null;
        const playersOnIceTeam = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        
        if (!playersOnIceTeam) {
          return (
            <div className="text-center text-red-500 py-4">
              <p>Error: Team data not found.</p>
              <p className="text-sm">Please go back and try again.</p>
            </div>
          );
        }
        
        return (
          <PlayersOnIceStep
            team={playersOnIceTeam}
            onPlayersSelect={handlePlayersOnIceSelect}
            preSelectedPlayers={[selectedScorer, primaryAssist, secondaryAssist].filter(Boolean)}
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
