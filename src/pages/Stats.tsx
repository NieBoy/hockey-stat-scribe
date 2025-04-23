
import { useState } from "react";
import { Bug } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import StatsHeader from "@/components/stats/StatsHeader";
import StatsContent from "@/components/stats/StatsContent";
import EmptyStatsState from "@/components/stats/EmptyStatsState";
import StatsDebugPanel from "@/components/stats/debug/StatsDebugPanel";
import { Button } from "@/components/ui/button";
import { useStatsData } from "@/hooks/stats/useStatsData";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";

export default function Stats() {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { stats, isLoading, error, isRefreshing, handleRefreshAllStats } = useStatsData();
  const { debugData } = useStatsDebugData();

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
        <div className="flex justify-between items-center">
          <StatsHeader 
            onRefresh={handleRefreshAllStats}
            isRefreshing={isRefreshing}
          />
          <Button
            variant="outline"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>

        {stats && stats.length > 0 ? (
          <StatsContent stats={stats} />
        ) : (
          <EmptyStatsState 
            onRefresh={handleRefreshAllStats}
            isRefreshing={isRefreshing}
          />
        )}
        
        {showDebugInfo && (
          <StatsDebugPanel 
            debugData={debugData}
            stats={stats || []}
          />
        )}
      </div>
    </MainLayout>
  );
}
