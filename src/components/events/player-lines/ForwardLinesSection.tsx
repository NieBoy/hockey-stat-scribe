
import { User } from '@/types';
import { PlayerCard } from './PlayerCard';

interface ForwardLine {
  lineNumber: number;
  leftWing: User | null;
  center: User | null;
  rightWing: User | null;
}

interface ForwardLinesSectionProps {
  forwardLines: ForwardLine[];
  selectedIds: Set<string>;
  onPlayerClick: (player: User) => void;
}

export function ForwardLinesSection({ forwardLines, selectedIds, onPlayerClick }: ForwardLinesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Forward Lines</h4>
      {forwardLines.map((line, index) => (
        <div key={`forward-line-${index}`} className="mb-2">
          <p className="text-xs text-muted-foreground">Line {line.lineNumber}</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <PlayerCard
                player={line.leftWing}
                position="LW"
                isSelected={line.leftWing ? selectedIds.has(line.leftWing.id) : false}
                onClick={onPlayerClick}
              />
            </div>
            <div>
              <PlayerCard
                player={line.center}
                position="C"
                isSelected={line.center ? selectedIds.has(line.center.id) : false}
                onClick={onPlayerClick}
              />
            </div>
            <div>
              <PlayerCard
                player={line.rightWing}
                position="RW"
                isSelected={line.rightWing ? selectedIds.has(line.rightWing.id) : false}
                onClick={onPlayerClick}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
