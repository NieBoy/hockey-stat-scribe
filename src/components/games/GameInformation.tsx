
import { format } from "date-fns";
import { Game } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface GameInformationProps {
  game: Game;
}

export function GameInformation({ game }: GameInformationProps) {
  // Calculate if it's an opponent game (no away team but has opponent_name)
  const isOpponentGame = !game.awayTeam && game.opponent_name;
  
  // Display text based on game type
  const versusText = isOpponentGame 
    ? `${game.homeTeam.name} vs ${game.opponent_name}`
    : `${game.homeTeam.name} vs ${game.awayTeam?.name || "Unknown Team"}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-muted-foreground mb-1">Date & Time</h3>
            <p>{format(new Date(game.date), "PPpp")}</p>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground mb-1">Teams</h3>
            <p>{versusText}</p>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground mb-1">Location</h3>
            <p>{game.location}</p>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground mb-1">Periods</h3>
            <p>{game.periods}</p>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground mb-1">Status</h3>
            <p>
              {game.is_active 
                ? `Active - Period ${game.current_period}`
                : game.current_period > 0 
                  ? "Completed" 
                  : "Not Started"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
