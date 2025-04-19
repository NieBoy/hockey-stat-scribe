
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getAllPlayerStats, refreshAllPlayerStats } from "@/services/stats/playerStatsService";
import StatsHeader from "@/components/stats/StatsHeader";
import StatsContent from "@/components/stats/StatsContent";
import EmptyStatsState from "@/components/stats/EmptyStatsState";

export default function Stats() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading, error, refetch } = useQuery({
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
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading stats: {(error as Error).message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <StatsHeader 
          onRefresh={handleRefreshAllStats}
          isRefreshing={isRefreshing}
        />

        {stats && stats.length > 0 ? (
          <StatsContent stats={stats} />
        ) : (
          <EmptyStatsState 
            onRefresh={handleRefreshAllStats}
            isRefreshing={isRefreshing}
          />
        )}
      </div>
    </MainLayout>
  );
}
