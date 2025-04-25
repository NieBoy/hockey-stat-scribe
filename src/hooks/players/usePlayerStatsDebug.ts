
import { useState } from "react";
import { usePlayerStatsData } from "./usePlayerStatsData";
import { toast } from "sonner";

/**
 * Custom hook to manage player stats debug functionality
 * @param playerId The player ID to fetch debug data for
 */
export function usePlayerStatsDebug(playerId: string) {
  const [showDebug, setShowDebug] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    stats, 
    statsLoading, 
    statsError,
    rawGameStats,
    playerGameEvents,
    teamGames,
    refetchStats,
    refetchRawStats,
    refetchEvents,
    playerTeam
  } = usePlayerStatsData(playerId);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log("Starting player stats refresh");
      await Promise.all([
        refetchStats(),
        refetchRawStats(),
        refetchEvents()
      ]);
      toast.success("Stats refreshed successfully");
      console.log("Player stats refresh completed");
    } catch (error) {
      console.error("Error refreshing stats:", error);
      toast.error("Failed to refresh stats");
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return {
    stats,
    statsLoading: statsLoading || isRefreshing,
    statsError,
    rawGameStats,
    playerGameEvents,
    teamGames,
    playerTeam,
    showDebug,
    toggleDebug,
    handleRefresh
  };
}
