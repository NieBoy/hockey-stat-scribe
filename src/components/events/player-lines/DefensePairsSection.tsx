
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
      {defensePairs.map((pair) => (
        <div key={`defense-pair-${pair.lineNumber}`} className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Pair {pair.lineNumber}</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Left Defense */}
            <Droppable droppableId={`defense-${pair.lineNumber}-LD`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[96px]",
                    snapshot.isDraggingOver && "bg-primary/5 rounded-md p-1"
                  )}
                >
                  <PlayerCard
                    player={pair.leftDefense}
                    position="LD"
                    isSelected={pair.leftDefense ? selectedIds.has(pair.leftDefense.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!pair.leftDefense}
                    index={0}
                    dragId={isDraggable && pair.leftDefense ? `defense-${pair.lineNumber}-LD-${pair.leftDefense.id}` : undefined}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            {/* Right Defense */}
            <Droppable droppableId={`defense-${pair.lineNumber}-RD`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[96px]",
                    snapshot.isDraggingOver && "bg-primary/5 rounded-md p-1"
                  )}
                >
                  <PlayerCard
                    player={pair.rightDefense}
                    position="RD"
                    isSelected={pair.rightDefense ? selectedIds.has(pair.rightDefense.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!pair.rightDefense}
                    index={0}
                    dragId={isDraggable && pair.rightDefense ? `defense-${pair.lineNumber}-RD-${pair.rightDefense.id}` : undefined}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      ))}
    </div>
  );
}
