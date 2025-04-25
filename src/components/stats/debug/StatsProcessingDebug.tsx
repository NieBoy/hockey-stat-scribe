
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { refreshPlayerStats } from "@/services/stats";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface StatsProcessingDebugProps {
  playerId: string;
  onStatsRefreshed?: (stats: any) => void;
}

const StatsProcessingDebug = ({ playerId, onStatsRefreshed }: StatsProcessingDebugProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<any>(null);

  const handleRefresh = async () => {
    if (!playerId) return;

    setIsRefreshing(true);
    try {
      // Call the refresh player stats function 
      const result = await refreshPlayerStats(playerId);
      setRefreshResult(result);
      toast.success("Player stats refresh completed");
      
      // Notify parent component
      if (onStatsRefreshed) {
        onStatsRefreshed(result);
      }
    } catch (error) {
      console.error("Error refreshing player stats:", error);
      toast.error("Failed to refresh player stats");
      setRefreshResult({ error: 'Failed to process stats' });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Stats Processing Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            The button below will manually refresh stats for this player by aggregating all raw game stats into player stats.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="w-full"
          >
            {isRefreshing ? "Processing..." : "Manually Refresh Player Stats"}
          </Button>
        </div>

        {refreshResult && (
          <div className="mt-2 bg-muted p-2 rounded text-xs overflow-auto max-h-20">
            <pre>{JSON.stringify(refreshResult, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsProcessingDebug;
