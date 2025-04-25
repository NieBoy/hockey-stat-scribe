
import React from "react";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
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

  const { transformedStats, statTypes } = useTransformedTeamStats(stats || [], team.players);

  // Function to handle the refresh button click
  // Make sure it returns a Promise to match expected type
  const handleRefresh = async (): Promise<void> => {
    await refreshStats();
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
        <Button onClick={handleRefresh} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TeamStatsHeader 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onToggleDebug={() => setDebugMode(!debugMode)}
        debugMode={debugMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {team.players.length > 0 ? (
            <TeamStatsTable 
              stats={transformedStats}
              statTypes={statTypes}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No players available for this team.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {debugMode && (
        <TeamStatsDebug
          team={team}
          refreshStatus={{}}
          onReprocessAllStats={async (): Promise<void> => {}}
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
