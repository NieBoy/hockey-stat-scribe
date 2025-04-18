
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';

interface GoaliesSectionProps {
  goalies: User[];
  selectedIds: Set<string>;
  onPlayerClick: (player: User) => void;
}

export function GoaliesSection({ goalies, selectedIds, onPlayerClick }: GoaliesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <div className="grid grid-cols-2 gap-2">
        {goalies.length > 0 ? (
          goalies.map(goalie => (
            <div key={goalie.id} className="col-span-1">
              <PlayerCard
                player={goalie}
                position="G"
                isSelected={selectedIds.has(goalie.id)}
                onClick={onPlayerClick}
              />
            </div>
          ))
        ) : (
          <div className="col-span-2">
            <PlayerCard player={null} position="G" isSelected={false} />
          </div>
        )}
      </div>
    </div>
  );
}
