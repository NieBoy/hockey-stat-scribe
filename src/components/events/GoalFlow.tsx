
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
import PlayerLines from './PlayerLines';
import { recordGoalEvent } from '@/services/events/goalEventService';
import { useToast } from '@/hooks/use-toast';

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
    // Make sure scorer and assists are included in players on ice
    const essentialPlayers = [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[];
    
    // Create a map of player IDs for quick lookup
    const selectedIds = new Map(players.map(player => [player.id, player]));
    
    // Add essential players if not already selected
    essentialPlayers.forEach(player => {
      if (!selectedIds.has(player.id)) {
        selectedIds.set(player.id, player);
      }
    });
    
    // Convert Map back to array
    const allPlayers = Array.from(selectedIds.values());
    
    // Limit to maximum 6 players on ice (5 skaters + 1 goalie)
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
      // Create goal event data object
      const goalData = {
        gameId: game.id,
        period: period,
        teamType: selectedTeam,
        scorerId: selectedScorer?.id,
        primaryAssistId: primaryAssist?.id,
        secondaryAssistId: secondaryAssist?.id,
        playersOnIce: playersOnIce.map(p => p.id)
      };
      
      // Call the service to record the goal event
      await recordGoalEvent(goalData);
      
      toast({
        title: "Goal Recorded",
        description: `Goal by ${selectedScorer?.name || 'Unknown'} in period ${period}`
      });
      
      // Call the complete handler to notify parent component
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
    
    if (currentStep === 'players-on-ice') {
      // Filter out players already selected for scorer/assists
      const selectedIds = new Set([
        selectedScorer?.id,
        primaryAssist?.id,
        secondaryAssist?.id
      ].filter(Boolean));
      
      // Pre-select scorer and assists for players on ice
      const preSelectedPlayers = [selectedScorer, primaryAssist, secondaryAssist]
        .filter(Boolean) as User[];
      
      return (
        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium">Select players on ice (+/-)</h3>
            <p className="text-sm text-muted-foreground">
              Select all players on the ice at the time of the goal (max 6)
            </p>
          </div>
          <PlayerLines 
            team={{...game.homeTeam}}
            onMultiPlayerSelect={handlePlayersOnIceSelect}
            selectedPlayers={preSelectedPlayers}
            multiSelect={true}
            allowComplete={true}
            onComplete={() => handlePlayersOnIceSelect(preSelectedPlayers)}
            completeText="Confirm Players"
            maxSelections={6}
          />
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
            <p><strong>Period:</strong> {period}</p>
            <div>
              <p><strong>Players on Ice:</strong></p>
              <ul className="list-disc pl-5 mt-1">
                {playersOnIce.map(player => (
                  <li key={player.id}>{player.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <GoalActions 
              isSubmitting={isSubmitting} 
              onCancel={onCancel} 
              onSubmit={handleSubmit}
              showSubmit={true}
            />
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
        {currentStep !== 'submit' && (
          <GoalActions isSubmitting={isSubmitting} onCancel={onCancel} />
        )}
      </CardContent>
    </Card>
  );
}
