
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AdvancedStatsView from "./advanced-stats/AdvancedStatsView";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { refreshPlayerStats } from "@/services/stats";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Game } from "@/types";

interface GameStatsProps {
  gameId: string;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: game, isLoading, error, refetch } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => getGameById(gameId)
  });

  // Function to refresh all player stats
  const handleRefreshAllStats = async () => {
    if (!game) return;
    
    setIsRefreshing(true);
    try {
      await refreshPlayerStats('all');
      toast.success("All player statistics have been recalculated.");
      await refetch();
    } catch (error) {
      toast.error("Failed to refresh statistics.");
      console.error("Error refreshing stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Need to cast game data to ensure it has all the required properties
  const gameData = game as Game;

  // Render advanced stats view with the game data and refresh button
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAllStats}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing Stats..." : "Refresh All Stats"}
        </Button>
      </div>
      <AdvancedStatsView game={gameData} />
    </>
  );
}
