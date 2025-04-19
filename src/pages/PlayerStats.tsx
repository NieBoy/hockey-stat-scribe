
import { useParams } from "react-router-dom";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bug } from "lucide-react";
import { refreshPlayerStats } from "@/services/stats";
import { toast } from "sonner";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import { usePlayerStatsData } from "@/hooks/players/usePlayerStatsData";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import PlayerStatsDebug from "@/components/players/PlayerStatsDebug";
import PlayerStatsEmpty from "@/components/players/PlayerStatsEmpty";
import { createStatsFromEvents } from "@/services/stats/gameStatsService";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { player, loading: playerLoading } = usePlayerDetails(id);
  
  const {
    stats,
    statsLoading,
    statsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats
  } = usePlayerStatsData(id || '');

  const handleRefreshStats = async () => {
    if (!id) return;
    
    console.log("Refresh stats button clicked for player:", id);
    setIsRefreshing(true);
    try {
      console.log("Generating game stats from events...");
      // First try to create any missing game stats from events
      if (playerGameEvents && playerGameEvents.length > 0) {
        console.log(`Found ${playerGameEvents.length} game events to process`);
        const statsCreated = await createStatsFromEvents(id);
        console.log("Stats created from events:", statsCreated);
        if (statsCreated) {
          console.log("Successfully created game stats from events");
          await refetchRawStats();
          console.log("Refetched raw stats");
        } else {
          console.log("No new stats were created from events");
        }
      } else {
        console.log("No game events found to process");
      }
      
      // Now refresh the player stats from all available game stats
      console.log("Refreshing player stats");
      await refreshPlayerStats(id);
      console.log("Player stats refreshed");
      await refetchStats();
      console.log("Refetched player stats");
      await refetchRawStats();
      console.log("Refetched raw stats again");
      
      toast.success("Stats Refreshed", {
        description: "Player statistics have been recalculated from game data."
      });
    } catch (error) {
      console.error("Error refreshing stats:", error);
      toast.error("Refresh Failed", {
        description: "Failed to refresh player statistics."
      });
    } finally {
      setIsRefreshing(false);
      console.log("Stats refresh process completed");
    }
  };

  if (statsLoading || playerLoading) {
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
          <div className="flex gap-2">
            <Button 
              onClick={handleRefreshStats} 
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDebugInfo ? "Hide Debug" : "Show Debug"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent>
            {stats && stats.length > 0 ? (
              <SortableStatsTable 
                stats={stats} 
                getPlayerName={(playerId) => player?.name || "Player"}
              />
            ) : (
              <PlayerStatsEmpty 
                gameStatsDebug={rawGameStats || []}
                playerGameEvents={playerGameEvents}
                onRefresh={handleRefreshStats}
              />
            )}
            
            {showDebugInfo && (
              <PlayerStatsDebug
                player={player}
                playerTeam={playerTeam}
                teamGames={teamGames || []}
                rawGameStats={rawGameStats || []}
                playerGameEvents={playerGameEvents || []}
                stats={stats || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
