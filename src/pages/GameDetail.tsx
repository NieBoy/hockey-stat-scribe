
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGameDetail } from "@/hooks/useGameDetail";
import { GameInformation } from "@/components/games/GameInformation";
import { GameActions } from "@/components/games/GameActions";
import { GameTabs } from "@/components/games/GameTabs";

export default function GameDetail() {
  const {
    game,
    isLoading,
    error,
    isStatTracker,
    assignedStatTypes,
    isCoach,
    id
  } = useGameDetail();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error || !game) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <h2 className="text-2xl font-bold">Game not found</h2>
            <p className="text-muted-foreground">
              The game you're looking for doesn't exist or there was an error loading it.
            </p>
            <Button asChild>
              <Link to="/games">Return to Games</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="mb-6">
          <Button variant="ghost" className="gap-1 mb-4" asChild>
            <Link to="/games">
              <ChevronLeft className="h-4 w-4" /> Back to Games
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Game Details</h1>
              <p className="text-muted-foreground">
                {game.homeTeam.name} vs {game.awayTeam.name}
              </p>
            </div>
            <GameActions
              gameId={id!}
              isCoach={isCoach}
              isStatTracker={isStatTracker}
              assignedStatTypes={assignedStatTypes}
            />
          </div>
        </div>

        <GameInformation game={game} />

        <div className="mt-6">
          <GameTabs
            gameId={id!}
            isCoach={isCoach}
            isStatTracker={isStatTracker}
            assignedStatTypes={assignedStatTypes}
          />
        </div>
      </div>
    </MainLayout>
  );
}
