
import { User } from '@/types';
import { Droppable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';

interface AvailablePlayersSectionProps {
  availablePlayers: User[];
}

export function AvailablePlayersSection({ availablePlayers }: AvailablePlayersSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Available Players</CardTitle>
      </CardHeader>
      <CardContent>
        <Droppable droppableId="roster" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
            >
              {availablePlayers.map((player, index) => (
                <div key={player.id} className="col-span-1">
                  <PlayerCard
                    player={player}
                    position={player.position || 'Player'}
                    isSelected={false}
                    isDraggable={true}
                    index={index}
                    dragId={`roster-0-P-${player.id}`}
                  />
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
}
