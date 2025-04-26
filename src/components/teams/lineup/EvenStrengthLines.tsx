
import { Lines, Position, User } from '@/types';
import { Button } from '@/components/ui/button';
import { ForwardLinesSection } from '@/components/events/player-lines/ForwardLinesSection';
import { DefensePairsSection } from '@/components/events/player-lines/DefensePairsSection';
import { GoaliesSection } from '@/components/events/player-lines/GoaliesSection';

interface EvenStrengthLinesProps {
  lines: Lines;
  onAddForwardLine: () => void;
  onAddDefenseLine: () => void;
  onPositionClick?: (lineType: 'forwards' | 'defense' | 'goalies', lineIndex: number, position: Position, player: User | null) => void;
}

export function EvenStrengthLines({ 
  lines, 
  onAddForwardLine, 
  onAddDefenseLine,
  onPositionClick
}: EvenStrengthLinesProps) {
  return (
    <div className="space-y-6">
      <ForwardLinesSection
        forwardLines={lines.forwards}
        isDraggable={false}
        onPositionClick={onPositionClick ? 
          (lineIndex, position, player) => onPositionClick('forwards', lineIndex, position as Position, player) : 
          undefined}
      />
      
      <Button 
        variant="outline" 
        onClick={onAddForwardLine} 
        className="mt-2 w-full"
      >
        Add Forward Line
      </Button>
      
      <DefensePairsSection
        defensePairs={lines.defense}
        isDraggable={false}
        onPositionClick={onPositionClick ? 
          (lineIndex, position, player) => onPositionClick('defense', lineIndex, position as Position, player) : 
          undefined}
      />
      
      <Button 
        variant="outline" 
        onClick={onAddDefenseLine} 
        className="mt-2 w-full"
      >
        Add Defense Pair
      </Button>

      <GoaliesSection 
        goalies={lines.goalies}
        isDraggable={false}
        onPositionClick={onPositionClick ? 
          (index, player) => onPositionClick('goalies', index, 'G' as Position, player) : 
          undefined}
      />
    </div>
  );
}
