
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';

interface GoaliesSectionProps {
  goalies: User[];
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
  onPositionClick?: (index: number, player: User | null) => void;
}

export function GoaliesSection({ 
  goalies, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  onPositionClick
}: GoaliesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Goalies</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-h-[96px]">
          <PlayerCard
            player={goalies[0] || null}
            position="G"
            isSelected={goalies[0] ? selectedIds.has(goalies[0].id) : false}
            onClick={onPositionClick ? () => onPositionClick(0, goalies[0] || null) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
          />
        </div>
        
        <div className="min-h-[96px]">
          <PlayerCard
            player={goalies[1] || null}
            position="G"
            isSelected={goalies[1] ? selectedIds.has(goalies[1].id) : false}
            onClick={onPositionClick ? () => onPositionClick(1, goalies[1] || null) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
