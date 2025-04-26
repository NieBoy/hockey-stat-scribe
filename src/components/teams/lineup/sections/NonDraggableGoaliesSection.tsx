
import { User } from '@/types';
import { PlayerCard } from './NonDraggablePlayerCard';

interface GoaliesSectionProps {
  goalies: User[];
  onPlayerSelect?: (index: number, playerId: string) => void;
  availablePlayers?: User[];
}

export function GoaliesSection({ 
  goalies,
  onPlayerSelect,
  availablePlayers = []
}: GoaliesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <div className="grid grid-cols-2 gap-2">
        <PlayerCard
          player={goalies[0] || null}
          position="G"
          availablePlayers={availablePlayers}
          onPlayerSelect={playerId => onPlayerSelect?.(0, playerId)}
        />
        <PlayerCard
          player={goalies[1] || null}
          position="G"
          availablePlayers={availablePlayers}
          onPlayerSelect={playerId => onPlayerSelect?.(1, playerId)}
        />
      </div>
    </div>
  );
}
