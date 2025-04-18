
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droppable } from '@hello-pangea/dnd';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface SpecialTeamsUnitProps {
  title: string;
  units: number[];
  positions: string[];
  type: 'pp' | 'pk';
  players?: Record<string, User | null>;
}

export function SpecialTeamsUnit({ title, units, positions, type, players = {} }: SpecialTeamsUnitProps) {
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
                  <Droppable key={pos} droppableId={`${type}-${unitNumber}-${pos}`}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "min-h-[96px]",
                          snapshot.isDraggingOver ? "bg-primary/5 rounded-md p-1" : ""
                        )}
                      >
                        <PlayerCard
                          player={player}
                          position={pos}
                          isSelected={false}
                          isDraggable={!!player}
                          index={0}
                          dragId={player ? `${type}-${unitNumber}-${pos}-${player.id}` : undefined}
                        />
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
