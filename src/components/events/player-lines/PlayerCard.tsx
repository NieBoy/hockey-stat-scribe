
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { UserCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';

interface PlayerCardProps {
  player: User | null;
  position: string;
  isSelected: boolean;
  onClick?: (player: User) => void;
  isDraggable?: boolean;
  index?: number;
  dragId?: string;
}

export function PlayerCard({ 
  player, 
  position, 
  isSelected, 
  onClick, 
  isDraggable = false, 
  index = 0,
  dragId
}: PlayerCardProps) {
  const renderCard = () => {
    if (!player) {
      return (
        <div className="flex flex-col items-center justify-center p-2 rounded-md border border-dashed border-gray-300 h-24 bg-background">
          <UserCircle className="h-8 w-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">{position}</span>
          <span className="text-xs text-gray-400">Empty</span>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        className={cn(
          "flex flex-col items-center justify-center h-24 w-full relative p-0",
          isSelected && "border-primary bg-primary/10",
          isDraggable && "cursor-grab active:cursor-grabbing"
        )}
        onClick={() => onClick?.(player)}
        type="button"
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

  if (isDraggable && player && dragId) {
    return (
      <Draggable draggableId={dragId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.6 : 1,
              transform: snapshot.isDragging ? provided.draggableProps.style.transform + ' scale(1.05)' : provided.draggableProps.style.transform,
            }}
            className={cn(
              "transition-all",
              snapshot.isDragging && "shadow-xl z-50"
            )}
          >
            {renderCard()}
          </div>
        )}
      </Draggable>
    );
  }

  return renderCard();
}
