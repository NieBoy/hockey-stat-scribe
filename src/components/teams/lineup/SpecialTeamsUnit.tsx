
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface SpecialTeamsUnitProps {
  title: string;
  units: number[];
  positions: string[];
  type: 'pp' | 'pk';
  players?: Record<string, User | null>;
  onPositionClick?: (lineIndex: number, position: string, player: User | null) => void;
}

export function SpecialTeamsUnit({ 
  title, 
  units, 
  positions, 
  type, 
  players = {},
  onPositionClick
}: SpecialTeamsUnitProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {units.map((unitNumber) => (
          <div key={`${type}-${unitNumber}`} className="mb-6">
            <h4 className="text-sm font-medium mb-2">{title} Unit {unitNumber}</h4>
            <div className={cn(
              "grid gap-2",
              positions.length === 5 ? "grid-cols-5" : "grid-cols-4",
            )}>
              {positions.map((pos, idx) => {
                const playerId = `${type}-${unitNumber}-${pos}`;
                const player = players?.[playerId] || null;
                
                return (
                  <div 
                    key={pos}
                    className="min-h-[96px]"
                  >
                    <PlayerCard
                      player={player}
                      position={pos}
                      isSelected={false}
                      onClick={onPositionClick ? () => onPositionClick(unitNumber - 1, pos, player) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
