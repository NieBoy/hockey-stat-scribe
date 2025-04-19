
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatsByPlayerId } from "@/services/stats";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getPlayerStatsWithRefresh } from "@/services/stats/playerStatsService";
import { useToast } from "@/hooks/use-toast";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => getPlayerStatsWithRefresh(id || ''),
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
  }, [id, stats, player, statsError]);

  const isLoading = statsLoading || playerLoading;
  
  const handleRefreshStats = async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      await refetchStats();
      toast({
        title: "Stats Refreshed",
        description: "Player statistics have been recalculated from game data."
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh player statistics.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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
          <Button 
            onClick={handleRefreshStats} 
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
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
                <p>No statistics available for this player.</p>
                <p className="mt-2 text-sm">This could mean:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>The player hasn't participated in any games</li>
                  <li>No stats have been recorded for this player</li>
                  <li>Stats need to be refreshed from game data</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
