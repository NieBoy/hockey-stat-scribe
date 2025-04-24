
import React from "react";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, History } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { useTeamStatsData } from "@/hooks/teams/useTeamStatsData";
import TeamStatsHeader from "./stats/TeamStatsHeader";
import TeamStatsDebug from "./stats/TeamStatsDebug";
import TeamStatsSettings from "./stats/TeamStatsSettings";

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
    isReprocessing,
    refreshStatus,
    refreshStats,
    handleReprocessAllStats,
    refetch
  } = useTeamStatsData(team);

  const handleAutoRefreshChange = (enabled: boolean) => {
    // Will be implemented in a future update
    console.log("Auto refresh:", enabled);
  };

  const handlePrecisionChange = (enabled: boolean) => {
    // Will be implemented in a future update
    console.log("High precision:", enabled);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <h3 className="font-semibold mb-1">Error loading team stats</h3>
        <p>{error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const hasStatsData = stats && stats.length > 0;

  return (
    <div className="space-y-6">
      <TeamStatsHeader 
        onRefresh={refreshStats}
        isRefreshing={isRefreshing}
        onToggleDebug={() => setDebugMode(!debugMode)}
        debugMode={debugMode}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {hasStatsData ? (
              <SortableStatsTable 
                stats={stats} 
                getPlayerName={(playerId) => {
                  const player = team.players.find(p => p.id === playerId);
                  return player?.name || "Unknown Player";
                }}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No statistics available for this team.</p>
                <p className="mt-2 text-sm">This could mean:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>No games have been played yet</li>
                  <li>No stats have been recorded</li>
                  <li>Stats need to be refreshed</li>
                </ul>
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
                  <Button 
                    onClick={handleReprocessAllStats} 
                    variant="outline" 
                    className="gap-2"
                    disabled={isReprocessing}
                  >
                    <History className="h-4 w-4" />
                    Reprocess All Stats
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <TeamStatsSettings
          onAutoRefreshChange={handleAutoRefreshChange}
          onPrecisionChange={handlePrecisionChange}
        />
      </div>

      {debugMode && (
        <TeamStatsDebug
          team={team}
          refreshStatus={refreshStatus}
          onReprocessAllStats={handleReprocessAllStats}
          isReprocessing={isReprocessing}
        />
      )}
    </div>
  );
};

export default StatsTabContent;
