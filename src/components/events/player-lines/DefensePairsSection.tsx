
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

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
}

export function DefensePairsSection({ 
  defensePairs, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  title = "Defense Pairs"
}: DefensePairsSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      {defensePairs.map((pair, pairIndex) => (
        <div key={`defense-pair-${pairIndex}`} className="mb-2">
          <p className="text-xs text-muted-foreground">Pair {pair.lineNumber}</p>
          <Droppable 
            droppableId={`defense-${pair.lineNumber}`} 
            direction="horizontal"
            isDropDisabled={!isDraggable}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "grid grid-cols-2 gap-2",
                  snapshot.isDraggingOver && "bg-muted/50 rounded-md"
                )}
              >
                <div>
                  <PlayerCard
                    player={pair.leftDefense}
                    position="LD"
                    isSelected={pair.leftDefense ? selectedIds.has(pair.leftDefense.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!pair.leftDefense}
                    index={0}
                    dragId={isDraggable && pair.leftDefense ? `defense-${pair.lineNumber}-LD-${pair.leftDefense.id}` : undefined}
                  />
                </div>
                <div>
                  <PlayerCard
                    player={pair.rightDefense}
                    position="RD"
                    isSelected={pair.rightDefense ? selectedIds.has(pair.rightDefense.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!pair.rightDefense}
                    index={1}
                    dragId={isDraggable && pair.rightDefense ? `defense-${pair.lineNumber}-RD-${pair.rightDefense.id}` : undefined}
                  />
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </div>
  );
}
