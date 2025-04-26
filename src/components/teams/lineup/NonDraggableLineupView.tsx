
import { Lines, User } from '@/types';
import { ForwardLinesSection } from './sections/NonDraggableForwardLinesSection';
import { DefensePairsSection } from './sections/NonDraggableDefensePairsSection';
import { GoaliesSection } from './sections/NonDraggableGoaliesSection';

interface NonDraggableLineupViewProps {
  lines: Lines;
  onPlayerSelect?: (lineType: 'forwards' | 'defense' | 'goalies', lineIndex: number, position: Position, playerId: string) => void;
  availablePlayers?: User[];
}

export function NonDraggableLineupView({ 
  lines,
  onPlayerSelect,
  availablePlayers = []
}: NonDraggableLineupViewProps) {
  return (
    <div className="space-y-4">
      <ForwardLinesSection 
        lines={lines.forwards} 
        availablePlayers={availablePlayers}
        onPlayerSelect={(lineIndex, position, playerId) => 
          onPlayerSelect?.('forwards', lineIndex, position, playerId)
        }
      />
      <DefensePairsSection 
        pairs={lines.defense}
        availablePlayers={availablePlayers}
        onPlayerSelect={(lineIndex, position, playerId) =>
          onPlayerSelect?.('defense', lineIndex, position, playerId)
        }
      />
      <GoaliesSection 
        goalies={lines.goalies}
        availablePlayers={availablePlayers}
        onPlayerSelect={(index, playerId) =>
          onPlayerSelect?.('goalies', index, 'G', playerId)
        }
      />
    </div>
  );
}
