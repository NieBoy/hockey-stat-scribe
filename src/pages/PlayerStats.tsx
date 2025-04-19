
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getPlayerStats, refreshPlayerStats } from "@/services/stats";
import { toast } from "sonner";
import { fetchGameStats } from "@/services/stats/gameStatsService";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gameStatsDebug, setGameStatsDebug] = useState<any[]>([]);

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => getPlayerStats(id || ''),
    enabled: !!id
  });

  const { player, loading: playerLoading } = usePlayerDetails(id);

  // Add debug query to check game_stats directly
  const { data: rawGameStats } = useQuery({
    queryKey: ['rawGameStats', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        // This will help us see if there are any game_stats at all for this player
        return await fetchGameStats('', id);
      } catch (error) {
        console.error("Error fetching raw game stats:", error);
        return [];
      }
    },
    enabled: !!id
  });

  useEffect(() => {
    console.log('Player Stats Debug:');
    console.log('Player ID:', id);
    console.log('Stats:', stats);
    console.log('Stats Loading:', statsLoading);
    console.log('Stats Error:', statsError);
    console.log('Player:', player);
    console.log('Raw Game Stats:', rawGameStats);
    
    if (rawGameStats && rawGameStats.length > 0) {
      setGameStatsDebug(rawGameStats);
    }
  }, [id, stats, player, statsError, rawGameStats]);

  const isLoading = statsLoading || playerLoading;
  
  const handleRefreshStats = async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      // Force a refresh of the player's stats
      await refreshPlayerStats(id);
      await refetchStats();
      toast.success("Stats Refreshed", {
        description: "Player statistics have been recalculated from game data."
      });
    } catch (error) {
      toast.error("Refresh Failed", {
        description: "Failed to refresh player statistics."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (statsError) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading stats: {(statsError as Error).message}
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
                
                {gameStatsDebug && gameStatsDebug.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                    <p className="font-medium mb-2">Debug Information:</p>
                    <p>Found {gameStatsDebug.length} raw game stats for this player that need to be processed.</p>
                    <p className="mt-2">Try clicking the "Refresh Stats" button above to calculate statistics from game data.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
