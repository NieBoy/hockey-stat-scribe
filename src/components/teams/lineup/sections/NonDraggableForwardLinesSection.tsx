
import { User } from '@/types';
import { PlayerCard } from './NonDraggablePlayerCard';

interface ForwardLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
}

interface ForwardLinesSectionProps {
  forwardLines: ForwardLine[];
}

export function ForwardLinesSection({ forwardLines }: ForwardLinesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Forward Lines</h4>
      {forwardLines.map((line) => (
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
  );
}
