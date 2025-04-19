
import React from 'react';
import { Team, User } from '@/types';
import PlayerLines from '../../PlayerLines';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
      <PlayerLines
        team={team}
        onPlayerSelect={onPlayerSelect}
        selectedPlayers={selectedScorer ? [selectedScorer] : []}
        multiSelect={false}
      />
    </div>
  );
}
