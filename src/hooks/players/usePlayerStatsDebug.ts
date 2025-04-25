
import { useState } from "react";
import { usePlayerStatsData } from "./usePlayerStatsData";

/**
 * Custom hook to manage player stats debug functionality
 * @param playerId The player ID to fetch debug data for
 */
export function usePlayerStatsDebug(playerId: string) {
  const [showDebug, setShowDebug] = useState(false);
  
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
    await Promise.all([
      refetchStats(),
      refetchRawStats(),
      refetchEvents()
    ]);
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return {
    stats,
    statsLoading,
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
