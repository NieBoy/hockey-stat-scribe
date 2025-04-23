
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface SimplePlayerListProps {
  players: User[];
  onPlayerSelect?: (player: User) => void;
  selectedPlayers?: User[];
}

export default function SimplePlayerList({ 
  players, 
  onPlayerSelect,
  selectedPlayers = []
}: SimplePlayerListProps) {
  // Sort players by number when possible
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    return numA - numB;
  });

  // Compare using player.id to match current step selection logic
  const isSelected = (player: User) => selectedPlayers.some(p => p.id === player.id);

  // Determine if a player is in the mandatory selection (cannot be deselected)
  const isMandatory = (player: User) => {
    // This is just UI indication - actual logic is in PlayersOnIceStep
    return false; // We'll handle the mandatory logic in the parent component
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {sortedPlayers.map(player => (
        <Card 
          key={player.id}
          className={`
            ${onPlayerSelect ? 'cursor-pointer' : ''}
            ${isSelected(player) ? 'border-primary ring-2 ring-primary' : ''}
            hover:bg-accent/50 transition-colors
          `}
          onClick={() => onPlayerSelect && onPlayerSelect(player)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {player.number && (
                <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                  #{player.number}
                </span>
              )}
              <span className="font-medium">{player.name}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
