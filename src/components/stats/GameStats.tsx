
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AdvancedStatsView from "./advanced-stats/AdvancedStatsView";

interface GameStatsProps {
  gameId: string;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const { data: game, isLoading } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => getGameById(gameId)
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!game) {
    return <p>No game data available</p>;
  }

  return <AdvancedStatsView game={game} />;
}
