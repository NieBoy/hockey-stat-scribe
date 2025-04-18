
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface GoaliesSectionProps {
  goalies: User[];
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
}

export function GoaliesSection({ 
  goalies, 
  selectedIds = new Set(), 
  onPlayerClick, 
  isDraggable = false 
}: GoaliesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <Droppable droppableId="goalies" direction="horizontal" isDropDisabled={!isDraggable}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "grid grid-cols-2 gap-2",
              snapshot.isDraggingOver && "bg-muted/50 rounded-md"
            )}
          >
            {goalies.length > 0 ? (
              goalies.map((goalie, index) => (
                <div key={goalie.id} className="col-span-1">
                  <PlayerCard
                    player={goalie}
                    position="G"
                    isSelected={selectedIds.has(goalie.id)}
                    onClick={onPlayerClick}
                    isDraggable={isDraggable}
                    index={index}
                    dragId={isDraggable ? `goalie-${goalie.id}` : undefined}
                  />
                </div>
              ))
            ) : (
              <>
                <div className="col-span-1">
                  <PlayerCard player={null} position="G" isSelected={false} />
                </div>
                <div className="col-span-1">
                  <PlayerCard player={null} position="G" isSelected={false} />
                </div>
              </>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
