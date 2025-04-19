
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatsByPlayerId } from "@/services/stats";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import { useEffect } from "react";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => getStatsByPlayerId(id || ''),
    enabled: !!id
  });

  const { player, loading: playerLoading } = usePlayerDetails(id);

  useEffect(() => {
    console.log('Player Stats Debug:');
    console.log('Player ID:', id);
    console.log('Stats:', stats);
    console.log('Stats Loading:', statsLoading);
    console.log('Stats Error:', statsError);
    console.log('Player:', player);
  }, [id, stats, player]);

  const isLoading = statsLoading || playerLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (statsError) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading stats: {statsError.message}
        </div>
      </MainLayout>
    );
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
            {stats && stats.length > 0 ? (
              <SortableStatsTable 
                stats={stats} 
                getPlayerName={(playerId) => player?.name || "Player"}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                No statistics available for this player.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
