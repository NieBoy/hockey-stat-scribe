
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface ForwardLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
}

interface ForwardLinesSectionProps {
  forwardLines: ForwardLine[];
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
  title?: string;
}

export function ForwardLinesSection({ 
  forwardLines, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  title = "Forward Lines"
}: ForwardLinesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      {forwardLines.map((line, lineIndex) => (
        <div key={`forward-line-${lineIndex}`} className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Line {line.lineNumber}</p>
          <Droppable 
            droppableId={`forward-${line.lineNumber}`} 
            direction="horizontal"
            isDropDisabled={!isDraggable}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "grid grid-cols-3 gap-2",
                  snapshot.isDraggingOver && "bg-primary/5 rounded-md p-2"
                )}
              >
                <div className="min-h-[96px]">
                  <PlayerCard
                    player={line.leftWing}
                    position="LW"
                    isSelected={line.leftWing ? selectedIds.has(line.leftWing.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!line.leftWing}
                    index={0}
                    dragId={isDraggable && line.leftWing ? `forward-${line.lineNumber}-LW-${line.leftWing.id}` : undefined}
                  />
                </div>
                <div className="min-h-[96px]">
                  <PlayerCard
                    player={line.center}
                    position="C"
                    isSelected={line.center ? selectedIds.has(line.center.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!line.center}
                    index={1}
                    dragId={isDraggable && line.center ? `forward-${line.lineNumber}-C-${line.center.id}` : undefined}
                  />
                </div>
                <div className="min-h-[96px]">
                  <PlayerCard
                    player={line.rightWing}
                    position="RW"
                    isSelected={line.rightWing ? selectedIds.has(line.rightWing.id) : false}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable && !!line.rightWing}
                    index={2}
                    dragId={isDraggable && line.rightWing ? `forward-${line.lineNumber}-RW-${line.rightWing.id}` : undefined}
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
