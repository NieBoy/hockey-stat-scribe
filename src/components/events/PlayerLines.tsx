
import { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildInitialLines } from '@/utils/lineupUtils';

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
  maxSelections
}: PlayerLinesProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedPlayers.map(p => p.id))
  );
  const lines = buildInitialLines(team);
  
  useEffect(() => {
    setSelectedIds(new Set(selectedPlayers.map(p => p.id)));
  }, [selectedPlayers]);

  const handlePlayerClick = (player: User) => {
    if (multiSelect) {
      const newSelectedIds = new Set(selectedIds);
      
      if (selectedIds.has(player.id)) {
        newSelectedIds.delete(player.id);
      } else {
        // Check if we've reached the max selections
        if (maxSelections && newSelectedIds.size >= maxSelections) {
          return;
        }
        newSelectedIds.add(player.id);
      }
      
      setSelectedIds(newSelectedIds);
      
      // Notify parent component of selection changes
      if (onMultiPlayerSelect) {
        const selectedPlayersList = team.players.filter(p => newSelectedIds.has(p.id));
        onMultiPlayerSelect(selectedPlayersList);
      }
    } else if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const renderPlayer = (player: User | null, position: string) => {
    if (!player) {
      return (
        <div className="flex flex-col items-center justify-center p-2 rounded-md border border-dashed border-gray-300 h-24">
          <UserCircle className="h-8 w-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">{position}</span>
          <span className="text-xs text-gray-400">Empty</span>
        </div>
      );
    }
    
    const isSelected = selectedIds.has(player.id);
    
    return (
      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-24 w-full relative p-0",
          isSelected && "border-primary bg-primary/10"
        )}
        onClick={() => handlePlayerClick(player)}
      >
        {isSelected && (
          <div className="absolute top-1 right-1">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
        <UserCircle className="h-8 w-8" />
        <div className="mt-1 text-xs">{position}</div>
        <div className="font-medium text-sm truncate max-w-full px-2">
          {player.name || "Unknown"}
        </div>
        {player.number && <div className="text-xs text-gray-500">#{player.number}</div>}
      </Button>
    );
  };
  
  const renderGoalies = () => (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <div className="grid grid-cols-2 gap-2">
        {lines.goalies.length > 0 ? (
          lines.goalies.map(goalie => (
            <div key={goalie.id} className="col-span-1">
              {renderPlayer(goalie, 'G')}
            </div>
          ))
        ) : (
          <div className="col-span-2">
            {renderPlayer(null, 'G')}
          </div>
        )}
      </div>
    </div>
  );

  const renderForwardLines = () => (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Forward Lines</h4>
      {lines.forwards.map((line, index) => (
        <div key={`forward-line-${index}`} className="mb-2">
          <p className="text-xs text-muted-foreground">Line {line.lineNumber}</p>
          <div className="grid grid-cols-3 gap-2">
            <div>{renderPlayer(line.leftWing, 'LW')}</div>
            <div>{renderPlayer(line.center, 'C')}</div>
            <div>{renderPlayer(line.rightWing, 'RW')}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDefenseLines = () => (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Defense Pairs</h4>
      {lines.defense.map((pair, index) => (
        <div key={`defense-pair-${index}`} className="mb-2">
          <p className="text-xs text-muted-foreground">Pair {pair.lineNumber}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>{renderPlayer(pair.leftDefense, 'LD')}</div>
            <div>{renderPlayer(pair.rightDefense, 'RD')}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render a simple list of all players if no line information is available
  const renderFallbackPlayerList = () => (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {team.players.map(player => (
        <div key={player.id}>
          {renderPlayer(player, player.position || 'Player')}
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
          {renderGoalies()}
          {renderForwardLines()}
          {renderDefenseLines()}
        </>
      ) : (
        renderFallbackPlayerList()
      )}
      
      <div className="mt-4 flex gap-2 justify-end">
        {allowSkip && onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            {skipText}
          </Button>
        )}
        {allowComplete && onComplete && (
          <Button 
            type="button" 
            onClick={onComplete}
          >
            {completeText}
          </Button>
        )}
      </div>
    </div>
  );
}
