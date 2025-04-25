
import { useState } from "react";
import { usePlayerStatsData } from "./usePlayerStatsData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function usePlayerStatsDebug(playerId: string) {
  const [showDebug, setShowDebug] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<string>('');
  
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
    setRefreshStatus('Starting refresh...');
    console.log(`Starting stats refresh for player ${playerId}`);
    
    try {
      // First fetch the events to ensure we have latest data
      setRefreshStatus('Fetching latest events...');
      console.log("Fetching latest events...");
      const eventsResult = await refetchEvents();
      console.log("Events fetched:", eventsResult);

      // Then fetch raw game stats
      setRefreshStatus('Fetching raw game stats...');
      console.log("Fetching raw game stats...");
      const rawStatsResult = await refetchRawStats();
      console.log("Raw stats fetched:", rawStatsResult);
      
      // Then call refresh_player_stats to ensure aggregated stats are up to date
      setRefreshStatus('Processing aggregated stats...');
      console.log("Calling refresh_player_stats database function...");
      const { error: refreshError } = await supabase.rpc('refresh_player_stats', {
        player_id: playerId
      });
      
      if (refreshError) {
        console.error("Error refreshing stats:", refreshError);
        throw refreshError;
      }
      
      // Finally refresh aggregated stats
      setRefreshStatus('Fetching updated stats...');
      console.log("Refreshing aggregated stats from database...");
      const statsResult = await refetchStats();
      console.log("Stats refreshed:", statsResult);
      
      setLastRefreshed(new Date());
      setRefreshStatus('Refresh completed successfully');
      toast.success("Stats refreshed successfully");
      console.log("Stats refresh completed successfully");
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      setRefreshStatus(`Error: ${errorMessage}`);
      console.error("Error during stats refresh:", error);
      toast.error(`Failed to refresh stats: ${errorMessage}`);
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
    isRefreshing,
    refreshStatus
  };
}
