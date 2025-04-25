
import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';

interface PlayerCardProps {
  player: User | null;
  position: string;
  isSelected?: boolean;
  onClick?: (player: User | null) => void;
  isDraggable?: boolean;
  index?: number;
  dragId?: string;
}

export function PlayerCard({ 
  player, 
  position,
  isSelected = false,
  onClick,
  isDraggable = false,
  index = 0,
  dragId
}: PlayerCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(player);
    }
  };

  const card = (
    <Card 
      className={cn(
        "relative border",
        isSelected && "border-primary",
        !player && "border-dashed",
        onClick && "cursor-pointer hover:border-primary hover:bg-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-3 text-center">
        {player ? (
          <>
            <p className="font-medium truncate">{player.name}</p>
            <p className="text-xs text-muted-foreground">{position}</p>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">Empty</p>
            <p className="text-xs text-muted-foreground">{position}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (isDraggable && player && dragId) {
    return (
      <Draggable draggableId={dragId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              snapshot.isDragging && "opacity-50",
              "h-full"
            )}
          >
            {card}
          </div>
        )}
      </Draggable>
    );
  }

  return card;
}
