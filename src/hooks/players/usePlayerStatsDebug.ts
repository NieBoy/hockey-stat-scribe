
import { useState } from "react";
import { usePlayerStatsData } from "./usePlayerStatsData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function usePlayerStatsDebug(playerId: string) {
  const [showDebug, setShowDebug] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
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
    if (isRefreshing) {
      console.log("Refresh already in progress, skipping...");
      return;
    }
    
    setIsRefreshing(true);
    console.log(`Starting stats refresh for player ${playerId}`);
    
    try {
      // First call refresh_player_stats to ensure aggregated stats are up to date
      console.log("Calling refresh_player_stats database function...");
      const { error: refreshError } = await supabase.rpc('refresh_player_stats', {
        player_id: playerId
      });
      
      if (refreshError) {
        console.error("Error refreshing stats:", refreshError);
        throw refreshError;
      }
      
      console.log("Database function completed, now refetching data...");
      
      // Then fetch the events to ensure we have latest data
      console.log("Fetching latest events...");
      await refetchEvents();
      
      // Then fetch raw game stats
      console.log("Fetching raw game stats...");
      await refetchRawStats();
      
      // Finally refresh aggregated stats
      console.log("Refreshing aggregated stats from database...");
      await refetchStats();
      
      setLastRefreshed(new Date());
      toast.success("Stats refreshed successfully");
      console.log("Stats refresh completed successfully");
    } catch (error: any) {
      console.error("Error during stats refresh:", error);
      toast.error(`Failed to refresh stats: ${error.message || "Unknown error"}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
    console.log(`Debug mode ${!showDebug ? 'enabled' : 'disabled'}`);
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
    handleRefresh,
    lastRefreshed,
    isRefreshing
  };
}
