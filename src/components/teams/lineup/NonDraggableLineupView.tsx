
import { Lines } from '@/types';
import { GoaliesSection } from '@/components/events/player-lines/GoaliesSection';
import { ForwardLinesSection } from '@/components/events/player-lines/ForwardLinesSection';
import { DefensePairsSection } from '@/components/events/player-lines/DefensePairsSection';

interface NonDraggableLineupViewProps {
  lines: Lines;
}

export function NonDraggableLineupView({ lines }: NonDraggableLineupViewProps) {
  return (
    <div className="space-y-6">
      {/* Goalies Section */}
      <GoaliesSection goalies={lines.goalies} />

      {/* Forward Lines Section */}
      <ForwardLinesSection forwardLines={lines.forwards} />

      {/* Defense Pairs Section */}
      <DefensePairsSection defensePairs={lines.defense} />
    </div>
  );
}
