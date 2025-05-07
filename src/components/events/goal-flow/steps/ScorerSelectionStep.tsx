
import React from 'react';
import { Team, User, Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { Loader2 } from 'lucide-react';
import { convertPlayersToUsers } from '@/utils/typeConversions';

interface ScorerSelectionStepProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedScorer: User | null;
  isLoadingLineups?: boolean;
  onRefreshLineups?: () => void;
}

export function ScorerSelectionStep({
  team,
  onPlayerSelect,
  selectedScorer,
  isLoadingLineups = false,
  onRefreshLineups
}: ScorerSelectionStepProps) {
  // Convert players to User type if needed
  const getPlayers = (): User[] => {
    if (!team.players) return [];
    
    if (team.players.length > 0 && 'email' in team.players[0]) {
      return team.players as User[];
    } else {
      return convertPlayersToUsers(team.players as Player[]);
    }
  };

  const players = getPlayers();
  const hasPlayers = players && players.length > 0;

  return (
    <div>
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-lg font-medium">Who scored the goal?</h3>
        {onRefreshLineups && (
          <Button 
            variant="ghost" 
            onClick={onRefreshLineups}
            disabled={isLoadingLineups}
            size="sm"
          >
            {isLoadingLineups && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {isLoadingLineups ? 'Loading...' : 'Refresh'}
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4">
          {isLoadingLineups ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading players...</p>
            </div>
          ) : hasPlayers ? (
            <SimplePlayerList
              players={players}
              onPlayerSelect={onPlayerSelect}
              selectedPlayers={selectedScorer ? [selectedScorer] : []}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No players available.</p>
              {onRefreshLineups && (
                <Button 
                  variant="outline" 
                  onClick={onRefreshLineups}
                  className="mt-2"
                >
                  Refresh Players
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
