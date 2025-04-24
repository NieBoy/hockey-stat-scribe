
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { Team } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamStatsDebugProps {
  team: Team;
  refreshStatus: Record<string, string>;
  onReprocessAllStats: () => Promise<void>;
  isReprocessing: boolean;
}

const TeamStatsDebug = ({
  team,
  refreshStatus,
  onReprocessAllStats,
  isReprocessing,
}: TeamStatsDebugProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Stats Debug Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              These tools are for debugging and managing team statistics. Use with caution.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onReprocessAllStats}
              disabled={isReprocessing}
            >
              <RefreshCw className="h-4 w-4" />
              {isReprocessing ? "Reprocessing..." : "Reprocess All Stats"}
            </Button>
          </div>

          {Object.keys(refreshStatus).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Player Refresh Status:</h3>
              <div className="border rounded divide-y text-sm">
                {Object.entries(refreshStatus).map(([playerId, status]) => {
                  const player = team.players.find((p) => p.id === playerId);
                  const statusColor =
                    status === "Success"
                      ? "text-green-500"
                      : status === "Failed"
                      ? "text-red-500"
                      : "text-blue-500";

                  return (
                    <div
                      key={playerId}
                      className="flex justify-between items-center px-3 py-1"
                    >
                      <span>
                        {player?.name || "Unknown"} ({playerId.substring(0, 8)}...)
                      </span>
                      <span className={statusColor}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamStatsDebug;
