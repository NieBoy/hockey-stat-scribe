
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PlayerStat } from "@/types";
import { refreshPlayerStats } from "@/services/stats/core/statsUpdates";

interface StatsProcessingDebugProps {
  playerId: string;
  onStatsRefreshed?: (stats: PlayerStat[]) => void;
}

export default function StatsProcessingDebug({ playerId, onStatsRefreshed }: StatsProcessingDebugProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log("Starting manual stats refresh for player:", playerId);
      const refreshedStats = await refreshPlayerStats(playerId);
      setLastRefreshTime(new Date());
      onStatsRefreshed?.(refreshedStats);
      console.log("Stats refresh completed successfully");
    } catch (err) {
      console.error("Error refreshing stats:", err);
      setError(err instanceof Error ? err.message : 'Failed to refresh stats');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          Stats Processing Debug
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Player ID:</strong> {playerId}
        </div>
        {lastRefreshTime && (
          <div>
            <strong>Last Refresh:</strong> {lastRefreshTime.toLocaleTimeString()}
          </div>
        )}
        {error && (
          <div className="text-red-500">
            <strong>Error:</strong> {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
