
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';

interface DefensePair {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
}

interface DefensePairsSectionProps {
  defensePairs: DefensePair[];
  selectedIds: Set<string>;
  onPlayerClick: (player: User) => void;
}

export function DefensePairsSection({ defensePairs, selectedIds, onPlayerClick }: DefensePairsSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Defense Pairs</h4>
      {defensePairs.map((pair, index) => (
        <div key={`defense-pair-${index}`} className="mb-2">
          <p className="text-xs text-muted-foreground">Pair {pair.lineNumber}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <PlayerCard
                player={pair.leftDefense}
                position="LD"
                isSelected={pair.leftDefense ? selectedIds.has(pair.leftDefense.id) : false}
                onClick={onPlayerClick}
              />
            </div>
            <div>
              <PlayerCard
                player={pair.rightDefense}
                position="RD"
                isSelected={pair.rightDefense ? selectedIds.has(pair.rightDefense.id) : false}
                onClick={onPlayerClick}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
