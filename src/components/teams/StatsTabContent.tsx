
import React, { useEffect } from "react";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    refetch
  } = useTeamStats(team.id);

  const { transformedStats, statTypes } = useTransformedTeamStats(stats || [], team.players);

  // Debug logging to check what data we're working with
  useEffect(() => {
    if (stats) {
      console.log("Raw team stats:", stats);
      // Log specific plusMinus stats
      const plusMinusStats = stats.filter(s => s.statType === 'plusMinus');
      console.log("PlusMinus stats:", plusMinusStats);
    }
    
    if (transformedStats) {
      console.log("Transformed stats:", transformedStats);
    }
  }, [stats, transformedStats]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <h3 className="font-semibold mb-1">Error loading team stats</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const handleRefreshStats = async () => {
    console.log("Manually refreshing team stats");
    await refetch();
  };

  return (
    <div className="space-y-6">
      <TeamStatsHeader 
        onToggleDebug={() => setDebugMode(!debugMode)}
        debugMode={debugMode}
        isRefreshing={isRefreshing}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Statistics</CardTitle>
          <Button variant="outline" onClick={handleRefreshStats} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Refresh Stats"}
          </Button>
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
