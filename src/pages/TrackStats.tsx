
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import StatTracker from "@/components/stats/StatTracker";
import { useAuth } from "@/hooks/useAuth";
import { getGameById } from "@/services/games";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import GameStatsList from "@/components/stats/GameStatsList";
import { useGameStats } from "@/hooks/useGameStats";

export default function TrackStats() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: game, isLoading: isGameLoading } = useQuery({
    queryKey: ['games', id],
    queryFn: () => getGameById(id),
    enabled: !!id
  });
  
  const { gameStats, handleStatRecorded, handleStatDeleted } = useGameStats(id);
  
  const userAssignment = user && game ? game.statTrackers.find(
    tracker => tracker.user.id === user.id
  ) : undefined;
  
  const assignedStatTypes = userAssignment?.statTypes || [];

  if (isGameLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game not found</h2>
          <Button asChild className="mt-4">
            <Link to="/games">Return to Games</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to={`/games/${id}`}>
            <ChevronLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Tracking Stats</h1>
            <p className="text-muted-foreground">
              {game.homeTeam.name} vs {game.awayTeam.name}
            </p>
          </div>
        </div>
      </div>

      {assignedStatTypes.length > 0 ? (
        <>
          <StatTracker 
            game={game}
            statTypes={assignedStatTypes}
            onStatRecorded={handleStatRecorded}
            existingStats={gameStats}
          />
          <GameStatsList 
            gameStats={gameStats}
            game={game}
            onDelete={handleStatDeleted}
          />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Stat Tracking Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't been assigned to track any stats for this game. Contact the coach to get assigned.
            </p>
            <Button asChild>
              <Link to={`/games/${id}`}>Return to Game</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
