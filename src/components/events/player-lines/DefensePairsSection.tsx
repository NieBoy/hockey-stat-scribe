
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';

interface DefensePair {
  lineNumber: number;
  leftDefense: User | null;
  rightDefense: User | null;
}

interface DefensePairsSectionProps {
  defensePairs: DefensePair[];
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
  title?: string;
  onPositionClick?: (lineIndex: number, position: string, player: User | null) => void;
}

export function DefensePairsSection({ 
  defensePairs, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  title = "Defense Pairs",
  onPositionClick
}: DefensePairsSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      {defensePairs.map((pair) => (
        <div key={`defense-pair-${pair.lineNumber}`} className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Pair {pair.lineNumber}</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Left Defense */}
            <div className="min-h-[96px]">
              <PlayerCard
                player={pair.leftDefense}
                position="LD"
                isSelected={pair.leftDefense ? selectedIds.has(pair.leftDefense.id) : false}
                onClick={onPositionClick ? () => onPositionClick(pair.lineNumber - 1, "LD", pair.leftDefense) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
              />
            </div>
            
            {/* Right Defense */}
            <div className="min-h-[96px]">
              <PlayerCard
                player={pair.rightDefense}
                position="RD"
                isSelected={pair.rightDefense ? selectedIds.has(pair.rightDefense.id) : false}
                onClick={onPositionClick ? () => onPositionClick(pair.lineNumber - 1, "RD", pair.rightDefense) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
