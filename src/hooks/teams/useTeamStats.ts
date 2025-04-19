
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { fetchGameStats } from "@/services/stats/gameStatsService";
import { getPlayerStatsWithRefresh } from "@/services/stats/playerStatsService";

export function useTeamStats(teamId: string) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: stats, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['teamStats', teamId],
    queryFn: async () => {
      try {
        // First get game stats for debugging
        const gameStats = await fetchGameStats(teamId);
        console.log('Raw game stats for team:', gameStats);
        
        // Then get the calculated player stats
        return await getPlayerStatsWithRefresh(teamId);
      } catch (error) {
        console.error("Error fetching team stats:", error);
        throw error;
      }
    }
  });

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Team statistics have been refreshed");
    } catch (error) {
      toast.error("Failed to refresh team statistics");
      console.error("Error refreshing team stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    stats,
    isLoading,
    error,
    refreshStats,
    isRefreshing
  };
}
