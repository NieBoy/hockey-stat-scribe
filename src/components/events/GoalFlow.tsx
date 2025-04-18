
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Game, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recordGoalEvent, GoalEventData } from '@/services/events/goalEventService';
import PlayerLines from '@/components/events/PlayerLines';

interface GoalFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

type FlowStep = 'team-select' | 'scorer-select' | 'primary-assist' | 'secondary-assist' | 'players-on-ice' | 'opponent-players-on-ice';

export default function GoalFlow({ game, period, onComplete, onCancel }: GoalFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset selected players when team changes
  useEffect(() => {
    setSelectedScorer(null);
    setPrimaryAssist(null);
    setSecondaryAssist(null);
    setPlayersOnIce([]);
  }, [selectedTeam]);

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    if (team === 'home') {
      setCurrentStep('scorer-select');
    } else {
      setCurrentStep('opponent-players-on-ice');
    }
  };

  const handleScorerSelect = (player: User) => {
    setSelectedScorer(player);
    setPlayersOnIce(prev => [...prev, player]);
    setCurrentStep('primary-assist');
  };

  const handlePrimaryAssistSelect = (player: User | null) => {
    setPrimaryAssist(player);
    if (player) setPlayersOnIce(prev => [...prev.filter(p => p.id !== player.id), player]);
    setCurrentStep('secondary-assist');
  };

  const handleSecondaryAssistSelect = (player: User | null) => {
    setSecondaryAssist(player);
    if (player) setPlayersOnIce(prev => [...prev.filter(p => p.id !== player.id), player]);
    setCurrentStep('players-on-ice');
  };

  // Validate that all player IDs exist in the database
  const validatePlayers = () => {
    // Create an array of all players from both teams for validation
    const allValidPlayerIds = [...game.homeTeam.players, ...game.awayTeam.players].map(p => p.id);
    
    // Check that each selected player exists in the valid players array
    for (const player of playersOnIce) {
      if (!allValidPlayerIds.includes(player.id)) {
        toast({
          title: "Invalid Player",
          description: `Player ${player.name} (${player.id}) is not valid in this game.`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handlePlayersOnIceSelect = (players: User[]) => {
    // Combine with already selected players (scorer and assists)
    const allPlayers = [...players];
    
    // Ensure scorer and assists are included if they exist
    if (selectedScorer && !players.some(p => p.id === selectedScorer.id)) {
      allPlayers.push(selectedScorer);
    }
    
    if (primaryAssist && !players.some(p => p.id === primaryAssist.id)) {
      allPlayers.push(primaryAssist);
    }
    
    if (secondaryAssist && !players.some(p => p.id === secondaryAssist.id)) {
      allPlayers.push(secondaryAssist);
    }
    
    // Ensure we don't have more than 6 players total
    const limitedPlayers = allPlayers.slice(0, 6);
    setPlayersOnIce(limitedPlayers);
  };

  const handleSkipAssists = () => {
    setCurrentStep('players-on-ice');
  };

  const handleOpponentPlayersOnIce = (players: User[]) => {
    setPlayersOnIce(players.slice(0, 6)); // Limit to 6 players
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !game.id) return;

    // Validate player IDs before submission
    if (!validatePlayers()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData: GoalEventData = {
        gameId: game.id,
        period,
        teamType: selectedTeam,
        playersOnIce: playersOnIce.map(p => p.id)
      };

      if (selectedTeam === 'home') {
        if (selectedScorer) goalData.scorerId = selectedScorer.id;
        if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
        if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      }

      await recordGoalEvent(goalData);

      toast({
        title: "Goal Recorded",
        description: selectedTeam === 'home' 
          ? `Goal by ${selectedScorer?.name || 'Unknown player'}`
          : `Goal against by ${game.awayTeam.name}`
      });

      onComplete();
    } catch (error: any) {
      console.error("Error recording goal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record goal event",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Which team scored?</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button 
                onClick={() => handleTeamSelect('home')}
                className="h-20 text-xl"
                variant="outline"
              >
                {game.homeTeam.name}
              </Button>
              <Button 
                onClick={() => handleTeamSelect('away')}
                className="h-20 text-xl"
                variant="outline"
              >
                {game.awayTeam.name}
              </Button>
            </div>
          </div>
        );

      case 'scorer-select':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Who scored the goal?</h3>
            <PlayerLines 
              team={game.homeTeam}
              onPlayerSelect={handleScorerSelect}
              selectedPlayers={[]}
            />
          </div>
        );

      case 'primary-assist':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary assist (if any)</h3>
            <PlayerLines 
              team={game.homeTeam}
              onPlayerSelect={handlePrimaryAssistSelect}
              selectedPlayers={[selectedScorer!]}
              allowSkip
              onSkip={handleSkipAssists}
              skipText="No assists"
            />
          </div>
        );

      case 'secondary-assist':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Secondary assist (if any)</h3>
            <PlayerLines 
              team={game.homeTeam}
              onPlayerSelect={handleSecondaryAssistSelect}
              selectedPlayers={[selectedScorer!, ...(primaryAssist ? [primaryAssist] : [])]}
              allowSkip
              onSkip={() => setCurrentStep('players-on-ice')}
              skipText="No secondary assist"
            />
          </div>
        );

      case 'players-on-ice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Who else was on the ice?</h3>
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
              completeText="Record Goal"
              maxSelections={6}
            />
          </div>
        );

      case 'opponent-players-on-ice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Who was on the ice for {game.homeTeam.name}?</h3>
            <p className="text-muted-foreground text-sm">Select up to 6 players who will receive a minus</p>
            <PlayerLines 
              team={game.homeTeam}
              onMultiPlayerSelect={handleOpponentPlayersOnIce}
              selectedPlayers={playersOnIce}
              multiSelect
              allowComplete
              onComplete={handleSubmit}
              completeText="Record Goal Against"
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
