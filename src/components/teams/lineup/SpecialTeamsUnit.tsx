
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
                    `grid grid-cols-${positions.length} gap-2`,
                    snapshot.isDraggingOver && "bg-muted/50 rounded-md",
                    "grid-cols-5"
                  )}
                >
                  {positions.map((pos, idx) => (
                    <div key={pos}>
                      <PlayerCard
                        player={null}
                        position={pos}
                        isSelected={false}
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
