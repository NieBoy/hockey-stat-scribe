
import { useParams } from "react-router-dom";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import { usePlayerStatsData } from "@/hooks/players/usePlayerStatsData";
import { createStatsFromEvents } from "@/services/stats/gameStatsService";
import PlayerStatsHeader from "@/components/players/stats/PlayerStatsHeader";
import PlayerStatsContent from "@/components/players/stats/PlayerStatsContent";

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

  const handleRefreshStats = async () => {
    if (!id) return;
    
    console.log("Refresh stats button clicked for player:", id);
    setIsRefreshing(true);
    
    try {
      console.log("Starting stats refresh process");
      await refetchPlayer();
      console.log("Refreshing game events");
      await refetchEvents();
      
      console.log("Creating game stats from events");
      try {
        const statsCreated = await createStatsFromEvents(id);
        console.log("Stats created from events:", statsCreated);
        
        if (statsCreated) {
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
        <PlayerStatsHeader
          playerName={player?.name}
          onRefresh={handleRefreshStats}
          isRefreshing={isRefreshing}
          onToggleDebug={() => setShowDebugInfo(!showDebugInfo)}
          showDebugInfo={showDebugInfo}
        />

        <PlayerStatsContent
          stats={stats || []}
          showDebugInfo={showDebugInfo}
          player={player}
          playerTeam={playerTeam}
          teamGames={teamGames || []}
          rawGameStats={rawGameStats || []}
          playerGameEvents={playerGameEvents || []}
          onRefresh={handleRefreshStats}
          playerId={id || ''}
        />
      </div>
    </MainLayout>
  );
}
