
import { Lines, User } from '@/types';
import { PlayerCard } from './NonDraggablePlayerCard';

interface DefensePairsSectionProps {
  pairs: Lines['defense'];
  onPlayerSelect?: (lineIndex: number, position: 'LD' | 'RD', playerId: string) => void;
  availablePlayers?: User[];
}

export function DefensePairsSection({ 
  pairs,
  onPlayerSelect,
  availablePlayers = []
}: DefensePairsSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Defense Pairs</h4>
      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-2 gap-2">
            <PlayerCard
              player={pair.leftDefense}
              position="LD"
              availablePlayers={availablePlayers}
              onPlayerSelect={playerId => onPlayerSelect?.(index, 'LD', playerId)}
            />
            <PlayerCard
              player={pair.rightDefense}
              position="RD"
              availablePlayers={availablePlayers}
              onPlayerSelect={playerId => onPlayerSelect?.(index, 'RD', playerId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
