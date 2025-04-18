
import { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { buildInitialLines } from '@/utils/lineupUtils';
import { PlayerCard } from './player-lines/PlayerCard';
import { GoaliesSection } from './player-lines/GoaliesSection';
import { ForwardLinesSection } from './player-lines/ForwardLinesSection';
import { DefensePairsSection } from './player-lines/DefensePairsSection';

interface PlayerLinesProps {
  team: Team;
  onPlayerSelect?: (player: User) => void;
  onMultiPlayerSelect?: (players: User[]) => void;
  selectedPlayers: User[];
  multiSelect?: boolean;
  allowSkip?: boolean;
  onSkip?: () => void;
  skipText?: string;
  allowComplete?: boolean;
  onComplete?: () => void;
  completeText?: string;
  maxSelections?: number;
  forceRefresh?: boolean;
}

export default function PlayerLines({
  team,
  onPlayerSelect,
  onMultiPlayerSelect,
  selectedPlayers = [],
  multiSelect = false,
  allowSkip = false,
  onSkip,
  skipText = "Skip",
  allowComplete = false,
  onComplete,
  completeText = "Complete",
  maxSelections,
  forceRefresh = false
}: PlayerLinesProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedPlayers.map(p => p.id))
  );
  const [lines, setLines] = useState(() => buildInitialLines(team));

  // Update lines when team or forceRefresh changes
  useEffect(() => {
    console.log("PlayerLines - Rebuilding lines due to team or forceRefresh change");
    setLines(buildInitialLines(team));
  }, [team, forceRefresh]);

  useEffect(() => {
    setSelectedIds(new Set(selectedPlayers.map(p => p.id)));
  }, [selectedPlayers]);

  const handlePlayerClick = (player: User) => {
    if (multiSelect) {
      const newSelectedIds = new Set(selectedIds);
      
      if (selectedIds.has(player.id)) {
        newSelectedIds.delete(player.id);
      } else {
        if (maxSelections && newSelectedIds.size >= maxSelections) {
          return;
        }
        newSelectedIds.add(player.id);
      }
      
      setSelectedIds(newSelectedIds);
      
      if (onMultiPlayerSelect) {
        const selectedPlayersList = team.players.filter(p => newSelectedIds.has(p.id));
        onMultiPlayerSelect(selectedPlayersList);
      }
    } else if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const renderFallbackPlayerList = () => (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {team.players.map(player => (
        <div key={player.id}>
          <PlayerCard
            player={player}
            position={player.position || 'Player'}
            isSelected={selectedIds.has(player.id)}
            onClick={handlePlayerClick}
          />
        </div>
      ))}
    </div>
  );

  const hasAnyLineInformation = lines.forwards.some(l => l.leftWing || l.center || l.rightWing) ||
                               lines.defense.some(l => l.leftDefense || l.rightDefense) ||
                               lines.goalies.length > 0;

  return (
    <div>
      {hasAnyLineInformation ? (
        <>
          <GoaliesSection 
            goalies={lines.goalies}
            selectedIds={selectedIds}
            onPlayerClick={handlePlayerClick}
          />
          <ForwardLinesSection 
            forwardLines={lines.forwards}
            selectedIds={selectedIds}
            onPlayerClick={handlePlayerClick}
          />
          <DefensePairsSection 
            defensePairs={lines.defense}
            selectedIds={selectedIds}
            onPlayerClick={handlePlayerClick}
          />
        </>
      ) : (
        renderFallbackPlayerList()
      )}
      
      <div className="mt-4 flex gap-2 justify-end">
        {allowSkip && onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            {skipText || "Skip"}
          </Button>
        )}
        {allowComplete && onComplete && (
          <Button type="button" onClick={onComplete}>
            {completeText || "Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}
