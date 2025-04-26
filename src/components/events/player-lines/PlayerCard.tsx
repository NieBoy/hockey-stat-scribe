
import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: User | null;
  position: string;
  isSelected?: boolean;
  onClick?: (player: User | null) => void;
}

export function PlayerCard({ 
  player, 
  position,
  isSelected = false,
  onClick
}: PlayerCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(player);
    }
  };

  return (
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
}
