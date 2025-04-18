
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droppable } from '@hello-pangea/dnd';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';
import { cn } from '@/lib/utils';

interface SpecialTeamsUnitProps {
  title: string;
  units: number[];
  positions: string[];
  type: 'pp' | 'pk';
}

export function SpecialTeamsUnit({ title, units, positions, type }: SpecialTeamsUnitProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {units.map((unitNumber) => (
          <div key={`${type}-${unitNumber}`} className="mb-6">
            <h4 className="text-sm font-medium mb-2">{title} Unit {unitNumber}</h4>
            <Droppable droppableId={`${type}-${unitNumber}`} direction="horizontal">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "grid gap-2",
                    positions.length === 5 ? "grid-cols-5" : "grid-cols-4",
                    snapshot.isDraggingOver ? "bg-primary/5 rounded-md p-2" : ""
                  )}
                >
                  {positions.map((pos, idx) => (
                    <div key={pos} className="min-h-[96px]">
                      <PlayerCard
                        player={null}
                        position={pos}
                        isSelected={false}
                        isDraggable={false}
                        index={idx}
                      />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
