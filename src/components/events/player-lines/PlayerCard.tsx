
import { User } from '@/types';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: User | null;
  position: string;
  isSelected?: boolean;
  onClick?: (player: User) => void;
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
    if (onClick && player) {
      onClick(player);
    }
  };

  const content = (
    <Card className={cn(
      "relative border",
      isSelected && "border-primary",
      !player && "border-dashed",
      onClick && player && "cursor-pointer"
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

  // Only wrap in Draggable if explicitly requested, dragId is provided, and a player exists
  if (isDraggable && dragId && player) {
    return (
      <Draggable draggableId={dragId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(snapshot.isDragging && "opacity-50")}
          >
            {content}
          </div>
        )}
      </Draggable>
    );
  }

  return content;
}
