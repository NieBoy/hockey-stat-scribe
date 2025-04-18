
import { User } from '@/types';
import { PlayerCard } from './NonDraggablePlayerCard';

interface DefensePair {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
}

interface DefensePairsSectionProps {
  defensePairs: DefensePair[];
}

export function DefensePairsSection({ defensePairs }: DefensePairsSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Defense Pairs</h4>
      {defensePairs.map((pair) => (
        <div key={`defense-pair-${pair.lineNumber}`} className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Pair {pair.lineNumber}</p>
          <div className="grid grid-cols-2 gap-2">
            <PlayerCard
              player={pair.leftDefense}
              position="LD"
            />
            <PlayerCard
              player={pair.rightDefense}
              position="RD"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
