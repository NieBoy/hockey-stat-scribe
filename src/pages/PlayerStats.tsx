
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const { player, loading: playerLoading, error: playerError, refetchPlayer } = usePlayerDetails(id);
  
  const {
    stats,
    statsLoading,
    statsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats,
    refetchEvents
  } = usePlayerStatsData(id || '');

  // Automatically show debug info if there's an issue with the player's user_id
  useEffect(() => {
    if (player && !player.id) {
      setShowDebugInfo(true);
    }
  }, [player]);

  const handleRefreshStats = async () => {
    if (!id) return;
    
    console.log("Refresh stats button clicked for player:", id);
    setIsRefreshing(true);
    
    try {
      console.log("Starting stats refresh process");
      
      // Make sure we have the latest player data
      await refetchPlayer();
      
      // First refresh events to make sure we have the latest data
      console.log("Refreshing game events");
      await refetchEvents();
      
      // Create game stats from events
      console.log("Creating game stats from events");
      try {
        const statsCreated = await createStatsFromEvents(id);
        console.log("Stats created from events:", statsCreated);
        
        // Now refresh the player stats from all available game stats
        console.log("Refreshing player stats aggregates");
        
        if (statsCreated) {
          await refreshPlayerStats(id);
          
          // Refetch stats to update the UI
          console.log("Refetching stats to update UI");
          await refetchStats();
          await refetchRawStats();
          
          toast.success("Stats Calculated", {
            description: "Player statistics have been calculated from game data."
          });
        } else {
          toast.info("No New Stats", {
            description: "No new statistics were generated from the game events."
          });
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("user_id")) {
          toast.error("Player User ID Issue", {
            description: "This player doesn't have a valid user ID association in the database. Please check the debug information and use the 'Fix User Association' button."
          });
          // Automatically show debug info when we encounter this error
          setShowDebugInfo(true);
        } else {
          toast.error("Stats Calculation Failed", {
            description: "Failed to calculate statistics: " + (error instanceof Error ? error.message : String(error))
          });
        }
        console.error("Error in stats creation process:", error);
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
      toast.error("Refresh Failed", {
        description: "Failed to refresh player statistics: " + (error instanceof Error ? error.message : String(error))
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

  if (playerError) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading player: {String(playerError)}
        </div>
      </MainLayout>
    );
  }

  if (statsError) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading stats: {String(statsError)}
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
                playerId={id || ''}
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
