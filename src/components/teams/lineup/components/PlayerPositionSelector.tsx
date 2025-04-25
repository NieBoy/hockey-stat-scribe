
import { useState } from "react";
import { User, Position } from "@/types";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PlayerPositionSelectorProps {
  position: Position;
  player: User | null;
  availablePlayers: User[];
  onSelect: (playerId: string) => void;
}

export function PlayerPositionSelector({
  position,
  player,
  availablePlayers,
  onSelect
}: PlayerPositionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get position-specific styling
  const getPositionStyles = () => {
    switch(position) {
      case 'LW':
      case 'C':
      case 'RW':
        return "border-blue-200 bg-blue-50";
      case 'LD':
      case 'RD':
        return "border-green-200 bg-green-50";
      case 'G':
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  // Combined list of available players plus the current player if selected
  const selectablePlayers = player 
    ? [...availablePlayers.filter(p => p.id !== player.id), player]
    : availablePlayers;

  // Sort players by name for easier selection
  const sortedPlayers = [...selectablePlayers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const debugInfo = () => {
    console.log(`Position ${position} - Current player:`, player);
    console.log(`Available players (${availablePlayers.length}):`, availablePlayers);
    console.log(`Selectable players (${selectablePlayers.length}):`, selectablePlayers);
  };

  return (
    <div className="space-y-1">
      <Select
        value={player?.id || "none"}
        onValueChange={onSelect}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) debugInfo();
        }}
      >
        <SelectTrigger 
          className={cn(
            "relative h-full min-h-[80px] flex flex-col items-start justify-center text-left",
            "transition-colors border-2",
            getPositionStyles()
          )}
        >
          <div className="absolute top-1 left-2 text-xs font-bold opacity-60">
            {position}
          </div>
          
          <SelectValue placeholder="Select player">
            {player ? (
              <div className="pt-2">
                <div className="font-medium">{player.name}</div>
                {player.number && (
                  <div className="text-xs opacity-70">#{player.number}</div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Empty Position</div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          <SelectItem value="none">None (Clear Position)</SelectItem>
          <div className="max-h-[200px] overflow-auto">
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} {p.number ? `#${p.number}` : ''}
                  {p.id === player?.id && " (Current)"}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                No players available
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
