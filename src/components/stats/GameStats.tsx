
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AdvancedStatsView from "./advanced-stats/AdvancedStatsView";
import { Card, CardContent } from "@/components/ui/card";

interface GameStatsProps {
  gameId: string;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const { data: game, isLoading, error } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => getGameById(gameId)
  });

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handle error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-500">
            Error loading game statistics: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle case when game is not found
  if (!game) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <p className="text-amber-500">No game data available for this ID</p>
        </CardContent>
      </Card>
    );
  }

  // Render advanced stats view with the game data
  return <AdvancedStatsView game={game} />;
}
