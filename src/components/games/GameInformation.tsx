
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from "@/types";

interface GameInformationProps {
  game: Game;
}

export function GameInformation({ game }: GameInformationProps) {
  const gameDate = game.date instanceof Date ? game.date : new Date(game.date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Teams</h3>
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg mb-3">
              <div>
                <div className="text-xl font-bold">{game.homeTeam.name}</div>
                <div className="text-muted-foreground">Home Team</div>
              </div>
              <div className="text-2xl font-bold">vs</div>
              <div className="text-right">
                <div className="text-xl font-bold">{game.awayTeam.name}</div>
                <div className="text-muted-foreground">Away Team</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(gameDate, 'PPP')}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{format(gameDate, 'p')}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{game.location}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Periods</span>
                <span className="font-medium">{game.periods}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${game.isActive ? 'text-green-600' : 'text-amber-600'}`}>
                  {game.isActive ? 'Active' : 'Upcoming'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
