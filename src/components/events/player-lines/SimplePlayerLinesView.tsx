
import { User, Team, Player } from '@/types';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SimplePlayerLinesViewProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedPlayers?: User[];
}

export function SimplePlayerLinesView({ team, onPlayerSelect, selectedPlayers = [] }: SimplePlayerLinesViewProps) {
  const isSelected = (player: User | Player) => selectedPlayers.some(p => p.id === player.id);

  // Convert Player to User for compatibility
  const convertPlayerToUser = (player: Player): User => {
    return {
      id: player.id,
      name: player.name || '',
      email: player.email || '',
      avatar_url: player.avatar_url,
      role: player.role as any,
      position: player.position
    };
  };

  // Simple player list if lines aren't available
  if (!team.lines) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {team.players?.map((player) => {
          const userPlayer = 'email' in player ? player as User : convertPlayerToUser(player as Player);
          return (
            <button
              key={player.id}
              onClick={() => onPlayerSelect(userPlayer)}
              className={cn(
                "p-2 text-sm rounded-md border transition-colors",
                "hover:bg-primary/10",
                isSelected(userPlayer) && "bg-primary/20 border-primary"
              )}
            >
              <div className="font-medium truncate">{player.name}</div>
              <div className="text-xs text-muted-foreground">
                {player.position || "No Pos"}
              </div>
            </button>
          );
        }) || null}
      </div>
    );
  }

  // Handle team line structures
  const lines = team.lines;
  if (!lines.forwards || !lines.defense) {
    return <div>Invalid line structure</div>;
  }

  return (
    <div className="space-y-4">
      {/* Forward Lines */}
      <div className="space-y-2">
        {lines.forwards.map((line: any, index: number) => (
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
        {lines.defense.map((pair: any, index: number) => (
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
