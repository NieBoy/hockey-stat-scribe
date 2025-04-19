
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatsByPlayerId } from "@/services/stats";
import { PlayerStat, StatType } from "@/types";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => getStatsByPlayerId(id || ''),
    enabled: !!id
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
          <p className="text-muted-foreground">
            View and analyze player performance statistics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SortableStatsTable 
              stats={stats || []} 
              getPlayerName={(playerId) => playerId} // This should be replaced with actual player name lookup
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
