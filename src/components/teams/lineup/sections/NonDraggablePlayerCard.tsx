
import { User, Position } from '@/types';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: User | null;
  position: Position;
  className?: string;
}

export function PlayerCard({ player, position, className }: PlayerCardProps) {
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

  return (
    <div
      className={cn(
        "p-2 rounded-md border border-gray-200",
        getBgColor(),
        player ? "hover:shadow-md" : "bg-opacity-50",
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
}
