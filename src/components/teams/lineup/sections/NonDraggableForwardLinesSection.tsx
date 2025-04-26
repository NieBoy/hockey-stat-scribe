
import { Lines, User } from '@/types';
import { PlayerCard } from './NonDraggablePlayerCard';

interface ForwardLinesSectionProps {
  lines: Lines['forwards'];
  onPlayerSelect?: (lineIndex: number, position: 'LW' | 'C' | 'RW', playerId: string) => void;
  availablePlayers?: User[];
}

export function ForwardLinesSection({ 
  lines,
  onPlayerSelect,
  availablePlayers = []
}: ForwardLinesSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Forward Lines</h4>
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <PlayerCard
              player={line.leftWing}
              position="LW"
              availablePlayers={availablePlayers}
              onPlayerSelect={playerId => onPlayerSelect?.(index, 'LW', playerId)}
            />
            <PlayerCard
              player={line.center}
              position="C"
              availablePlayers={availablePlayers}
              onPlayerSelect={playerId => onPlayerSelect?.(index, 'C', playerId)}
            />
            <PlayerCard
              player={line.rightWing}
              position="RW"
              availablePlayers={availablePlayers}
              onPlayerSelect={playerId => onPlayerSelect?.(index, 'RW', playerId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
