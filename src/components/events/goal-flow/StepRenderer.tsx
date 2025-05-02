
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Game } from '@/types';
import { TeamSelectionStep } from './steps/TeamSelectionStep';
import { ScorerSelectionStep } from './steps/ScorerSelectionStep';
import { AssistSelectionStep } from './steps/AssistSelectionStep';
import { PlayersOnIceStep } from './steps/PlayersOnIceStep';
import { GoalSummaryStep } from './steps/GoalSummaryStep';
import { OpponentGoalForm } from './steps/OpponentGoalForm';

interface StepRendererProps {
  goalFlow: any; // Using any here to avoid redefining the whole useGoalFlow return type
  game: Game;
  onCancel: () => void;
  period: number;
}

export function StepRenderer({
  goalFlow,
  game,
  onCancel,
  period
}: StepRendererProps) {
  const {
    currentStep,
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isSubmitting,
    isLoadingLineups,
    isOpponentTeam,
    opponentJerseyNumbers,
    handleRefreshLineups,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleOpponentJerseyNumber,
    handleOpponentGoalComplete,
    handleNextStep,
    handleSubmit
  } = goalFlow;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelectionStep game={game} onTeamSelect={handleTeamSelect} />;
        
      case 'opponent-goal':
        return (
          <OpponentGoalForm
            onJerseyNumberChange={handleOpponentJerseyNumber}
            onComplete={handleOpponentGoalComplete}
            jerseyNumbers={opponentJerseyNumbers}
          />
        );
        
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
        // Always use home team for on-ice players when dealing with opponent goals
        // This ensures we get the correct players for plus/minus
        const playersTeam = isOpponentTeam ? game.homeTeam : 
                            (selectedTeam === 'home' ? game.homeTeam : game.awayTeam);
        
        console.log("Players on ice step - Using team:", {
          teamName: playersTeam?.name,
          isOpponentGoal: isOpponentTeam,
          playerCount: playersTeam?.players?.length || 0
        });
        
        if (!playersTeam) {
          return (
            <div className="text-center text-red-500 py-4">
              <p>Error: Team data not found.</p>
              <p className="text-sm">Please go back and try again.</p>
            </div>
          );
        }
        
        // For opponent goals, we don't have selected scorer/assists from our team
        // so don't pass preSelectedPlayers
        const preSelectedPlayers = isOpponentTeam 
          ? []
          : [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean);
        
        return (
          <PlayersOnIceStep
            team={playersTeam}
            onPlayersSelect={handlePlayersOnIceSelect}
            preSelectedPlayers={preSelectedPlayers}
            onComplete={handleNextStep}
            isOpponentTeam={isOpponentTeam}
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
            isOpponentTeam={isOpponentTeam}
            opponentJerseyNumbers={isOpponentTeam ? opponentJerseyNumbers : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <CardContent>
      {renderStepContent()}
    </CardContent>
  );
}
