
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
  
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  
  const handlePlayerSelect = (player: User) => {
    setSelectedPlayer(player);
  };

  const renderStepContent = () => (
    <div>
      {selectedTeam ? (
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
            players={selectedTeam === 'home' ? game.homeTeam.players : game.awayTeam.players}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
          />
        </div>
      ) : (
        <TeamSelect game={game} onTeamSelect={setSelectedTeam} />
      )}
    </div>
  );

  return (
    <Card>
      <GoalHeader game={game} selectedTeam={selectedTeam} />
      <CardContent>
        {renderStepContent()}
        <GoalActions isSubmitting={false} onCancel={onCancel} />
      </CardContent>
    </Card>
  );
}
