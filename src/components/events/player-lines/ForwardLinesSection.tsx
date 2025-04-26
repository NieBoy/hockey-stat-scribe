
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
  selectedIds?: Set<string>;
  onPlayerClick?: (player: User) => void;
  isDraggable?: boolean;
  title?: string;
  onPositionClick?: (lineIndex: number, position: string, player: User | null) => void;
}

export function ForwardLinesSection({ 
  forwardLines, 
  selectedIds = new Set(), 
  onPlayerClick,
  isDraggable = false,
  title = "Forward Lines",
  onPositionClick
}: ForwardLinesSectionProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      {forwardLines.map((line) => (
        <div key={`forward-line-${line.lineNumber}`} className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Line {line.lineNumber}</p>
          <div className="grid grid-cols-3 gap-2">
            {/* Left Wing */}
            <div className="min-h-[96px]">
              <PlayerCard
                player={line.leftWing}
                position="LW"
                isSelected={line.leftWing ? selectedIds.has(line.leftWing.id) : false}
                onClick={onPositionClick ? () => onPositionClick(line.lineNumber - 1, "LW", line.leftWing) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
              />
            </div>
            
            {/* Center */}
            <div className="min-h-[96px]">
              <PlayerCard
                player={line.center}
                position="C"
                isSelected={line.center ? selectedIds.has(line.center.id) : false}
                onClick={onPositionClick ? () => onPositionClick(line.lineNumber - 1, "C", line.center) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
              />
            </div>
            
            {/* Right Wing */}
            <div className="min-h-[96px]">
              <PlayerCard
                player={line.rightWing}
                position="RW"
                isSelected={line.rightWing ? selectedIds.has(line.rightWing.id) : false}
                onClick={onPositionClick ? () => onPositionClick(line.lineNumber - 1, "RW", line.rightWing) : onPlayerClick ? (player) => onPlayerClick(player!) : undefined}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
