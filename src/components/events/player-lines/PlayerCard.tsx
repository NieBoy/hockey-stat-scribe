
import { User } from '@/types';
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
        <div className="flex items-center justify-center p-1 rounded-md border border-dashed border-gray-300 h-16 bg-background">
          <div className="flex flex-col items-center">
            <UserCircle className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">{position}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 h-16 w-full relative p-2 rounded-md border",
          isSelected ? "border-primary bg-primary/10" : "border-gray-200",
          isDraggable ? "cursor-grab active:cursor-grabbing" : "",
          onClick ? "hover:bg-accent" : ""
        )}
        onClick={onClick ? () => onClick(player) : undefined}
      >
        <div className="flex-shrink-0">
          <UserCircle className="h-6 w-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="font-medium text-sm truncate">
            {player.name || "Unknown"}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{position}</span>
            {player.number && <span>#{player.number}</span>}
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-1 right-1">
            <Check className="h-3 w-3 text-primary" />
          </div>
        )}
      </div>
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
