
import React from "react";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, History } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import TeamStatsHeader from "./stats/TeamStatsHeader";
import TeamStatsDebug from "./stats/TeamStatsDebug";
import TeamStatsSettings from "./stats/TeamStatsSettings";
import { useTeamStats } from "@/hooks/teams/useTeamStats";
import { useTransformedTeamStats } from "@/hooks/teams/useTransformedTeamStats";
import { TeamStatsTable } from "./stats/TeamStatsTable";

interface StatsTabContentProps {
  team: Team;
}

const StatsTabContent = ({ team }: StatsTabContentProps) => {
  const [debugMode, setDebugMode] = React.useState(false);
  
  const {
    stats,
    isLoading,
    error,
    isRefreshing,
    refreshStats,
  } = useTeamStats(team.id);

  const { transformedStats, statTypes } = useTransformedTeamStats(stats || []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <h3 className="font-semibold mb-1">Error loading team stats</h3>
        <p>{error.message}</p>
        <Button onClick={refreshStats} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TeamStatsHeader 
        onRefresh={refreshStats}
        isRefreshing={isRefreshing}
        onToggleDebug={() => setDebugMode(!debugMode)}
        debugMode={debugMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {transformedStats.length > 0 ? (
            <TeamStatsTable 
              stats={transformedStats}
              statTypes={statTypes}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No statistics available for this team.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                <Button 
                  onClick={refreshStats} 
                  variant="outline" 
                  className="gap-2"
                  disabled={isRefreshing}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Stats
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {debugMode && (
        <TeamStatsDebug
          team={team}
          refreshStatus={{}}
          onReprocessAllStats={() => {}}
          isReprocessing={false}
        />
      )}

      <TeamStatsSettings
        onAutoRefreshChange={() => {}}
        onPrecisionChange={() => {}}
      />
    </div>
  );
}

export default StatsTabContent;
