
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import StatsHeader from "@/components/stats/StatsHeader";
import StatsContent from "@/components/stats/StatsContent";
import { useStatsData } from "@/hooks/stats/useStatsData";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Award, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Stats() {
  const { stats, isLoading, error, isRefreshing, handleRefreshAllStats } = useStatsData();
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  const handleRefresh = async () => {
    try {
      await handleRefreshAllStats();
      setRefreshError(null);
    } catch (error) {
      setRefreshError(error as Error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <StatsHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        <div className="bg-muted/50 border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Stars Leaderboard
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                View the top performing players across all teams
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/stars" className="flex items-center gap-1">
                View Stars <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-800 rounded-md p-4 mb-4">
            <p className="font-medium">Error loading statistics</p>
            <p className="text-sm mt-1">{error.message}</p>
            <Button variant="outline" className="mt-2" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <StatsContent stats={stats || []} />
        )}

        {refreshError && (
          <div className="bg-red-50 text-red-800 rounded-md p-4 mt-4">
            <p className="font-medium">Error refreshing statistics</p>
            <p className="text-sm mt-1">{refreshError.message}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
