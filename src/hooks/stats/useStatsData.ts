
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlayerStat } from "@/types";
import { getAllPlayerStats, refreshPlayerStats, reprocessAllStats } from "@/services/stats";

export function useStatsData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<PlayerStat[]>({
    queryKey: ['playerStats'],
    queryFn: getAllPlayerStats,
  });

  const handleRefreshAllStats = async () => {
    setIsRefreshing(true);
    try {
      await refreshPlayerStats('all'); // Pass 'all' to indicate system-wide refresh
      toast.success("All player statistics have been recalculated.");
      await refetch();
    } catch (error) {
      toast.error("Failed to refresh statistics.");
      console.error("Error refreshing stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReprocessAllStats = async () => {
    setIsReprocessing(true);
    try {
      const success = await reprocessAllStats();
      if (success) {
        toast.success("All statistics have been reprocessed from game events");
        await refetch();
      } else {
        toast.error("Failed to reprocess statistics");
      }
    } catch (error) {
      console.error("Error reprocessing stats:", error);
      toast.error("Error reprocessing statistics");
    } finally {
      setIsReprocessing(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    isRefreshing,
    isReprocessing,
    handleRefreshAllStats,
    handleReprocessAllStats
  };
}
