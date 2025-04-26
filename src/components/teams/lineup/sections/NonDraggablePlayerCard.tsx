
import { User, Position } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

interface PlayerCardProps {
  player: User | null;
  position: Position;
  className?: string;
  availablePlayers?: User[];
  onPlayerSelect?: (playerId: string | 'none') => void;
}

export function PlayerCard({ 
  player, 
  position, 
  className,
  availablePlayers = [],
  onPlayerSelect
}: PlayerCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Background color based on position
  const getBgColor = () => {
    switch (position) {
      case 'LW':
      case 'C':
      case 'RW':
        return 'bg-blue-50';
      case 'LD':
      case 'RD':
        return 'bg-green-50';
      case 'G':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Sort players by number then name
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  const handleSelect = (selectedPlayerId: string | 'none') => {
    if (onPlayerSelect) {
      onPlayerSelect(selectedPlayerId);
      setIsOpen(false);
    }
  };

  const renderCard = () => (
    <div
      className={cn(
        "p-2 rounded-md border border-gray-200",
        getBgColor(),
        player ? "hover:shadow-md" : "bg-opacity-50",
        onPlayerSelect && "cursor-pointer hover:border-primary",
        className
      )}
    >
      <div className="text-xs font-semibold text-gray-500">{position}</div>
      <div className="font-medium">
        {player ? player.name : "Empty"}
      </div>
      {player?.number && (
        <div className="text-xs text-gray-500">#{player.number}</div>
      )}
    </div>
  );

  if (!onPlayerSelect) {
    return renderCard();
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {renderCard()}
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        className="w-[200px] p-2"
        sideOffset={5}
      >
        <ScrollArea className="h-[200px]">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start h-8" 
              onClick={() => handleSelect('none')}
            >
              None (Clear Position)
            </Button>
            
            {player && (
              <Button
                key={player.id}
                variant="ghost"
                className="w-full justify-start h-8"
                onClick={() => handleSelect(player.id)}
              >
                {player.name} {player.number && `#${player.number}`} (Current)
              </Button>
            )}
            
            {sortedPlayers.map(availablePlayer => (
              <Button
                key={availablePlayer.id}
                variant="ghost"
                className="w-full justify-start h-8"
                onClick={() => handleSelect(availablePlayer.id)}
              >
                {availablePlayer.name} {availablePlayer.number && `#${availablePlayer.number}`}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
