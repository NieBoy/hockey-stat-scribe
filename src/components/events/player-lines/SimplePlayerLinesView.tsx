
import { User, Team } from '@/types';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SimplePlayerLinesViewProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedPlayers?: User[];
}

export function SimplePlayerLinesView({ team, onPlayerSelect, selectedPlayers = [] }: SimplePlayerLinesViewProps) {
  const isSelected = (player: User) => selectedPlayers.some(p => p.id === player.id);

  return (
    <div className="space-y-4">
      {/* Forward Lines */}
      <div className="space-y-2">
        {team.lines?.forwards.map((line, index) => (
          <Card key={`forward-line-${index}`} className="p-2">
            <div className="grid grid-cols-3 gap-2">
              {[line.leftWing, line.center, line.rightWing].map((player, pos) => (
                player && (
                  <button
                    key={`${index}-${pos}`}
                    onClick={() => onPlayerSelect(player)}
                    className={cn(
                      "p-2 text-sm rounded-md border transition-colors",
                      "hover:bg-primary/10",
                      isSelected(player) && "bg-primary/20 border-primary"
                    )}
                  >
                    <div className="font-medium truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pos === 0 ? 'LW' : pos === 1 ? 'C' : 'RW'}
                    </div>
                  </button>
                )
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Defense Pairs */}
      <div className="space-y-2">
        {team.lines?.defense.map((pair, index) => (
          <Card key={`defense-pair-${index}`} className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {[pair.leftDefense, pair.rightDefense].map((player, pos) => (
                player && (
                  <button
                    key={`${index}-${pos}`}
                    onClick={() => onPlayerSelect(player)}
                    className={cn(
                      "p-2 text-sm rounded-md border transition-colors",
                      "hover:bg-primary/10",
                      isSelected(player) && "bg-primary/20 border-primary"
                    )}
                  >
                    <div className="font-medium truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pos === 0 ? 'LD' : 'RD'}
                    </div>
                  </button>
                )
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
