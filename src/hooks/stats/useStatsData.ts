
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlayerStat } from "@/types";
import { getAllPlayerStats, refreshAllPlayerStats } from "@/services/stats";

export function useStatsData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      await refreshAllPlayerStats();
      toast.success("All player statistics have been recalculated.");
      await refetch();
    } catch (error) {
      toast.error("Failed to refresh statistics.");
      console.error("Error refreshing stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    isRefreshing,
    handleRefreshAllStats
  };
}
