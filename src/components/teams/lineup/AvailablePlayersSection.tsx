
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';

interface AvailablePlayersSectionProps {
  availablePlayers: User[];
  onPlayerSelect?: (player: User) => void;
}

export function AvailablePlayersSection({ 
  availablePlayers,
  onPlayerSelect 
}: AvailablePlayersSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Available Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 min-h-[120px]">
          {availablePlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              position={player.position || 'P'}
              isSelected={false}
              onClick={onPlayerSelect ? () => onPlayerSelect(player) : undefined}
            />
          ))}
          {availablePlayers.length === 0 && (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              No available players
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
