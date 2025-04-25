
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface GoaliesSectionProps {
  goalies: User[];
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
  onPositionClick?: (index: number, player: User | null) => void;
}

export function GoaliesSection({ 
  goalies, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  onPositionClick
}: GoaliesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <div className="grid grid-cols-2 gap-2">
        <Droppable droppableId="goalie-G">
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
                player={goalies[0] || null}
                position="G"
                isSelected={goalies[0] ? selectedIds.has(goalies[0].id) : false}
                onClick={onPositionClick ? () => onPositionClick(0, goalies[0] || null) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
                isDraggable={isDraggable && !!goalies[0]}
                index={0}
                dragId={isDraggable && goalies[0] ? `goalie-G-${goalies[0].id}` : undefined}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        <Droppable droppableId="goalie-G2">
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
                player={goalies[1] || null}
                position="G"
                isSelected={goalies[1] ? selectedIds.has(goalies[1].id) : false}
                onClick={onPositionClick ? () => onPositionClick(1, goalies[1] || null) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
                isDraggable={isDraggable && !!goalies[1]}
                index={0}
                dragId={isDraggable && goalies[1] ? `goalie-G2-${goalies[1].id}` : undefined}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
