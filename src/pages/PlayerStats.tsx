
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatsByPlayerId } from "@/services/stats";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => getStatsByPlayerId(id || ''),
    enabled: !!id
  });

  const { player, loading: playerLoading } = usePlayerDetails(id);

  const isLoading = statsLoading || playerLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {player?.name || "Player"}'s Statistics
            </h1>
            <p className="text-muted-foreground">
              View and analyze performance statistics
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SortableStatsTable 
              stats={stats || []} 
              getPlayerName={(playerId) => {
                // For a single player page, we can just return the player's name
                return player?.name || "Player";
              }}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
