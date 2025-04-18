
import { Lines } from '@/types';
import { Button } from '@/components/ui/button';
import { ForwardLinesSection } from '@/components/events/player-lines/ForwardLinesSection';
import { DefensePairsSection } from '@/components/events/player-lines/DefensePairsSection';
import { GoaliesSection } from '@/components/events/player-lines/GoaliesSection';

interface EvenStrengthLinesProps {
  lines: Lines;
  onAddForwardLine: () => void;
  onAddDefenseLine: () => void;
}

export function EvenStrengthLines({ 
  lines, 
  onAddForwardLine, 
  onAddDefenseLine 
}: EvenStrengthLinesProps) {
  return (
    <div className="space-y-6">
      <ForwardLinesSection
        forwardLines={lines.forwards}
        isDraggable={true}
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
        isDraggable={true}
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
        isDraggable={true}
      />
    </div>
  );
}
