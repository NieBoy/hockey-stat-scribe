
import { Lines } from '@/types';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';

interface NonDraggableLineupViewProps {
  lines: Lines;
}

export function NonDraggableLineupView({ lines }: NonDraggableLineupViewProps) {
  return (
    <div className="space-y-6">
      {/* Goalies Section */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Goalies</h4>
        <div className="grid grid-cols-2 gap-2">
          <PlayerCard
            player={lines.goalies[0] || null}
            position="G"
          />
          <PlayerCard
            player={lines.goalies[1] || null}
            position="G"
          />
        </div>
      </div>

      {/* Forward Lines Section */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Forward Lines</h4>
        {lines.forwards.map((line) => (
          <div key={`forward-line-${line.lineNumber}`} className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Line {line.lineNumber}</p>
            <div className="grid grid-cols-3 gap-2">
              <PlayerCard
                player={line.leftWing}
                position="LW"
              />
              <PlayerCard
                player={line.center}
                position="C"
              />
              <PlayerCard
                player={line.rightWing}
                position="RW"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Defense Pairs Section */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Defense Pairs</h4>
        {lines.defense.map((pair) => (
          <div key={`defense-pair-${pair.lineNumber}`} className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Pair {pair.lineNumber}</p>
            <div className="grid grid-cols-2 gap-2">
              <PlayerCard
                player={pair.leftDefense}
                position="LD"
              />
              <PlayerCard
                player={pair.rightDefense}
                position="RD"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
