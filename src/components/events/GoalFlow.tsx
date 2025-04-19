
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game, User } from '@/types';
import { GoalHeader } from './goal-flow/GoalHeader';
import { GoalActions } from './goal-flow/GoalActions';
import { useGoalFlow } from './goal-flow/useGoalFlow';
import { recordGoalEvent } from '@/services/events/goalEventService';
import { useToast } from '@/hooks/use-toast';
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
    selectedTeam,
    hasLoadedLineups,
    isLoadingLineups,
    handleRefreshLineups,
    setSelectedTeam
  } = useGoalFlow(game, period, onComplete);
  
  const [currentStep, setCurrentStep] = useState<'team' | 'scorer' | 'primary' | 'secondary' | 'players-on-ice' | 'submit'>('team');
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handlePlayerSelect = (player: User) => {
    if (currentStep === 'scorer') {
      setSelectedScorer(player);
      setCurrentStep('primary');
    } else if (currentStep === 'primary') {
      setPrimaryAssist(player);
      setCurrentStep('secondary');
    } else if (currentStep === 'secondary') {
      setSecondaryAssist(player);
      setCurrentStep('players-on-ice');
    }
  };

  const handleSkipAssist = () => {
    if (currentStep === 'primary') {
      setPrimaryAssist(null);
      setCurrentStep('secondary');
    } else if (currentStep === 'secondary') {
      setSecondaryAssist(null);
      setCurrentStep('players-on-ice');
    }
  };

  const handlePlayersOnIceSelect = (players: User[]) => {
    setPlayersOnIce(players);
  };

  const handlePlayersOnIceComplete = () => {
    const essentialPlayers = [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[];
    const selectedIds = new Map(playersOnIce.map(player => [player.id, player]));
    essentialPlayers.forEach(player => {
      if (!selectedIds.has(player.id)) {
        selectedIds.set(player.id, player);
      }
    });
    const allPlayers = Array.from(selectedIds.values());
    const limitedPlayers = allPlayers.slice(0, 6);
    setPlayersOnIce(limitedPlayers);
    setCurrentStep('submit');
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !game.id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const goalData = {
        gameId: game.id,
        period: period,
        teamType: selectedTeam,
        scorerId: selectedScorer?.id,
        primaryAssistId: primaryAssist?.id,
        secondaryAssistId: secondaryAssist?.id,
        playersOnIce: playersOnIce.map(p => p.id)
      };
      
      await recordGoalEvent(goalData);
      
      toast({
        title: "Goal Recorded",
        description: `Goal by ${selectedScorer?.name || 'Unknown'} in period ${period}`
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to record goal event",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (selectedTeam) {
      setCurrentStep('scorer');
    }
  }, [selectedTeam]);

  const renderStepContent = () => {
    if (currentStep === 'team' || !selectedTeam) {
      return <TeamSelectionStep game={game} onTeamSelect={setSelectedTeam} />;
    }
    
    const teamData = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
    
    if (currentStep === 'scorer') {
      return (
        <ScorerSelectionStep
          team={teamData}
          onPlayerSelect={handlePlayerSelect}
          selectedScorer={selectedScorer}
          isLoadingLineups={isLoadingLineups}
          onRefreshLineups={handleRefreshLineups}
        />
      );
    }
    
    if (currentStep === 'primary') {
      return (
        <AssistSelectionStep
          team={teamData}
          onPlayerSelect={handlePlayerSelect}
          selectedAssist={primaryAssist}
          excludedPlayers={[selectedScorer].filter(Boolean) as User[]}
          isPrimary={true}
          onSkip={handleSkipAssist}
        />
      );
    }
    
    if (currentStep === 'secondary') {
      return (
        <AssistSelectionStep
          team={teamData}
          onPlayerSelect={handlePlayerSelect}
          selectedAssist={secondaryAssist}
          excludedPlayers={[selectedScorer, primaryAssist].filter(Boolean) as User[]}
          isPrimary={false}
          onSkip={handleSkipAssist}
        />
      );
    }
    
    if (currentStep === 'players-on-ice') {
      return (
        <PlayersOnIceStep
          team={teamData}
          onPlayersSelect={handlePlayersOnIceSelect}
          preSelectedPlayers={[selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[]}
          onComplete={handlePlayersOnIceComplete}
        />
      );
    }
    
    if (currentStep === 'submit') {
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
    }
  };

  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      <CardContent>
        {renderStepContent()}
        {currentStep !== 'submit' && (
          <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />
        )}
      </CardContent>
    </Card>
  );
}
