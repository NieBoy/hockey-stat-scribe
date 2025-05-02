
import React from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';

interface ScorerSelectionStepProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedScorer: User | null;
  isLoadingLineups: boolean;
  onRefreshLineups: () => void;
}

export function ScorerSelectionStep({
  team,
  onPlayerSelect,
  selectedScorer,
  isLoadingLineups,
  onRefreshLineups
}: ScorerSelectionStepProps) {
  // Check if we have valid team and players data
  const hasPlayers = team?.players && team.players.length > 0;
  
  console.log('ScorerSelectionStep - Team:', team?.id, team?.name);
  console.log('ScorerSelectionStep - Players count:', team?.players?.length || 0);
  console.log('ScorerSelectionStep - Has Players:', hasPlayers);
  console.log('ScorerSelectionStep - Is Loading:', isLoadingLineups);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Who scored the goal?</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshLineups}
          disabled={isLoadingLineups}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingLineups ? 'animate-spin' : ''}`} />
          Refresh Players
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {isLoadingLineups ? (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">Loading players...</p>
            </div>
          ) : hasPlayers ? (
            <SimplePlayerList
              players={team.players}
              onPlayerSelect={onPlayerSelect}
              selectedPlayers={selectedScorer ? [selectedScorer] : []}
            />
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>No players found for this team.</p>
              <p className="text-sm mt-1">Try refreshing the player list.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
