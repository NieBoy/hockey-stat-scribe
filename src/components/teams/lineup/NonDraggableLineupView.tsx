
import { Lines } from '@/types';
import { GoaliesSection } from './sections/NonDraggableGoaliesSection';
import { ForwardLinesSection } from './sections/NonDraggableForwardLinesSection';
import { DefensePairsSection } from './sections/NonDraggableDefensePairsSection';

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
