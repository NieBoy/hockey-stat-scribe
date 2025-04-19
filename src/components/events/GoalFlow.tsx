
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Game, User } from '@/types';
import { Button } from '@/components/ui/button';
import { TeamSelect } from './goal-flow/TeamSelect';
import { RefreshCw } from 'lucide-react';
import { useGoalFlow } from './goal-flow/useGoalFlow';
import { GoalHeader } from './goal-flow/GoalHeader';
import { GoalActions } from './goal-flow/GoalActions';
import SimplePlayerList from '../teams/SimplePlayerList';

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
  
  // Track the current step in the flow
  const [currentStep, setCurrentStep] = useState<'team' | 'scorer' | 'primary' | 'secondary' | 'submit'>('team');
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePlayerSelect = (player: User) => {
    if (currentStep === 'scorer') {
      setSelectedScorer(player);
      setCurrentStep('primary');
    } else if (currentStep === 'primary') {
      setPrimaryAssist(player);
      setCurrentStep('secondary');
    } else if (currentStep === 'secondary') {
      setSecondaryAssist(player);
      setCurrentStep('submit');
    }
  };

  const handleSkipAssist = () => {
    if (currentStep === 'primary') {
      setPrimaryAssist(null);
      setCurrentStep('secondary');
    } else if (currentStep === 'secondary') {
      setSecondaryAssist(null);
      setCurrentStep('submit');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Construct players on ice array
      const playersOnIce = [selectedScorer];
      if (primaryAssist) playersOnIce.push(primaryAssist);
      if (secondaryAssist) playersOnIce.push(secondaryAssist);
      
      // Here you would call your API to save the goal
      console.log('Submitting goal:', {
        scorer: selectedScorer?.name,
        primaryAssist: primaryAssist?.name || 'None',
        secondaryAssist: secondaryAssist?.name || 'None',
        team: selectedTeam
      });
      
      // Call the complete handler to notify parent component
      onComplete();
    } catch (error) {
      console.error('Error saving goal:', error);
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
      return <TeamSelect game={game} onTeamSelect={setSelectedTeam} />;
    }
    
    const teamPlayers = selectedTeam === 'home' ? game.homeTeam.players : game.awayTeam.players;
    
    if (currentStep === 'scorer') {
      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Who scored the goal?</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshLineups}
              disabled={isLoadingLineups}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingLineups ? 'animate-spin' : ''}`} />
              Refresh Players
            </Button>
          </div>
          <SimplePlayerList
            players={teamPlayers}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={selectedScorer ? [selectedScorer] : []}
          />
        </div>
      );
    }
    
    if (currentStep === 'primary') {
      // Filter out the scorer from the list of potential assists
      const eligiblePlayers = teamPlayers.filter(p => p.id !== selectedScorer?.id);
      return (
        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Who had the primary assist?</h3>
          </div>
          <SimplePlayerList
            players={eligiblePlayers}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={primaryAssist ? [primaryAssist] : []}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleSkipAssist}>Skip (No Assist)</Button>
          </div>
        </div>
      );
    }
    
    if (currentStep === 'secondary') {
      // Filter out scorer and primary assist from potential secondary assists
      const eligiblePlayers = teamPlayers.filter(
        p => p.id !== selectedScorer?.id && p.id !== primaryAssist?.id
      );
      return (
        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Who had the secondary assist?</h3>
          </div>
          <SimplePlayerList
            players={eligiblePlayers}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={secondaryAssist ? [secondaryAssist] : []}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleSkipAssist}>Skip (No Second Assist)</Button>
          </div>
        </div>
      );
    }
    
    if (currentStep === 'submit') {
      return (
        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Goal Summary</h3>
          </div>
          <div className="space-y-2 bg-muted/50 p-4 rounded-md">
            <p><strong>Scorer:</strong> {selectedScorer?.name}</p>
            <p><strong>Primary Assist:</strong> {primaryAssist?.name || 'None'}</p>
            <p><strong>Secondary Assist:</strong> {secondaryAssist?.name || 'None'}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      <CardContent>
        {renderStepContent()}
        <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />
      </CardContent>
    </Card>
  );
}
