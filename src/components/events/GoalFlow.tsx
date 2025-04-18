
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Game } from '@/types';
import { useGoalFlow } from '@/hooks/useGoalFlow';
import { TeamSelect } from './goal-flow/TeamSelect';
import { PlayerSelect } from './goal-flow/PlayerSelect';
import PlayerLines from './PlayerLines';
import { getTeamLineup } from '@/services/teams/lineupManagement';
import { RefreshCw } from 'lucide-react';

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

  // Add state to track if lineup data has been fetched
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);
  
  // Load lineup data when the component mounts
  useEffect(() => {
    const loadLineupData = async () => {
      if (!selectedTeam || hasLoadedLineups) return;
      
      try {
        setIsLoadingLineups(true);
        const teamToLoad = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        console.log("GoalFlow - Loading lineup data for team:", teamToLoad.id);
        
        const lineupData = await getTeamLineup(teamToLoad.id);
        console.log("GoalFlow - Retrieved lineup data:", lineupData);
        
        // Check if we have any real position data
        const hasPositions = lineupData.some(player => player.position !== null);
        
        if (!hasPositions) {
          console.warn("GoalFlow - No player positions found in the lineup data");
        }
        
        setHasLoadedLineups(true);
      } catch (error) {
        console.error("GoalFlow - Error loading lineup data:", error);
      } finally {
        setIsLoadingLineups(false);
      }
    };
    
    loadLineupData();
  }, [selectedTeam, game, hasLoadedLineups]);

  // Function to refresh lineup data
  const handleRefreshLineups = async () => {
    try {
      setIsLoadingLineups(true);
      const teamToLoad = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
      console.log("GoalFlow - Refreshing lineup data for team:", teamToLoad.id);
      
      const lineupData = await getTeamLineup(teamToLoad.id);
      console.log("GoalFlow - Refreshed lineup data:", lineupData);
      
      // Force a re-render by updating state
      setHasLoadedLineups(false);
      setTimeout(() => setHasLoadedLineups(true), 0);
    } catch (error) {
      console.error("GoalFlow - Error refreshing lineup data:", error);
    } finally {
      setIsLoadingLineups(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'team-select':
        return <TeamSelect game={game} onTeamSelect={handleTeamSelect} />;

      case 'scorer-select':
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
                Refresh Lineup
              </Button>
            </div>
            <PlayerSelect
              team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
              title=""
              onPlayerSelect={handleScorerSelect}
              selectedPlayers={[]}
              showLineups={true}
            />
          </div>
        );

      case 'primary-assist':
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Primary assist (if any)</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshLineups}
                disabled={isLoadingLineups}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingLineups ? 'animate-spin' : ''}`} />
                Refresh Lineup
              </Button>
            </div>
            <PlayerSelect
              team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
              title=""
              onPlayerSelect={handlePrimaryAssistSelect}
              selectedPlayers={[selectedScorer!]}
              allowSkip
              skipText="No assists"
              showLineups={true}
            />
          </div>
        );

      case 'secondary-assist':
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Secondary assist (if any)</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshLineups}
                disabled={isLoadingLineups}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingLineups ? 'animate-spin' : ''}`} />
                Refresh Lineup
              </Button>
            </div>
            <PlayerSelect
              team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
              title=""
              onPlayerSelect={handleSecondaryAssistSelect}
              selectedPlayers={[selectedScorer!, ...(primaryAssist ? [primaryAssist] : [])]}
              allowSkip
              skipText="No secondary assist"
              showLineups={true}
            />
          </div>
        );

      case 'players-on-ice':
      case 'opponent-players-on-ice':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {currentStep === 'players-on-ice' 
                  ? "Who else was on the ice?"
                  : `Who was on the ice for ${game.homeTeam.name}?`}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshLineups}
                disabled={isLoadingLineups}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingLineups ? 'animate-spin' : ''}`} />
                Refresh Lineup
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Select up to {6 - playersOnIce.length} more players (already selected: {playersOnIce.length})
            </p>
            <PlayerLines 
              team={selectedTeam === 'home' ? game.homeTeam : game.awayTeam}
              onMultiPlayerSelect={handlePlayersOnIceSelect}
              selectedPlayers={playersOnIce}
              multiSelect
              allowComplete
              onComplete={handleSubmit}
              completeText={currentStep === 'players-on-ice' ? "Record Goal" : "Record Goal Against"}
              maxSelections={6}
              forceRefresh={hasLoadedLineups}
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
