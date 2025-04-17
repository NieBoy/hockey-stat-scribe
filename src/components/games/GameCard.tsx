
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { format } from "date-fns";
import { CalendarClock, MapPin, Users, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const formattedDate = format(new Date(game.date), "MMM d, yyyy");
  const formattedTime = format(new Date(game.date), "h:mm a");
  const { user } = useAuth();
  const isCoach = user?.role.includes('coach');
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{game.homeTeam.name} vs {game.awayTeam.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarClock className="h-3.5 w-3.5 mr-1" />
              {formattedDate} at {formattedTime}
            </CardDescription>
            <CardDescription className="flex items-center mt-0.5">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {game.location}
            </CardDescription>
          </div>
          <Badge variant={game.isActive ? "default" : "secondary"}>
            {game.isActive ? "Active" : "Upcoming"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium flex items-center mb-2">
          <Users className="mr-2 h-4 w-4" /> Stat Trackers
        </h4>
        {game.statTrackers.length > 0 ? (
          <div className="space-y-2">
            {game.statTrackers.map((tracker, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{tracker.user.name}</span>
                <Badge variant="outline" className="capitalize">
                  {tracker.statTypes.join(", ")}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No stat trackers assigned yet.</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex flex-col w-full gap-2">
          <Button asChild>
            <Link to={`/games/${game.id}`}>View Game</Link>
          </Button>
          {game.isActive ? (
            <Button variant="secondary" asChild>
              <Link to={`/games/${game.id}/track`}>Track Stats</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to={`/games/${game.id}/manage`}>Manage Game</Link>
              </Button>
              {isCoach && (
                <Button variant="secondary" asChild>
                  <Link to={`/games/${game.id}/assign-trackers`}>
                    <UserPlus className="mr-2 h-4 w-4" /> Assign Trackers
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
