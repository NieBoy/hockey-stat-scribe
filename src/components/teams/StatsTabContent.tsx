
import React from "react";
import { useTeamStats } from "@/hooks/teams/useTeamStats";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";

interface StatsTabContentProps {
  team: Team;
}

const StatsTabContent = ({ team }: StatsTabContentProps) => {
  const { 
    stats, 
    isLoading, 
    error, 
    refreshStats,
    isRefreshing 
  } = useTeamStats(team.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading team stats: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Team Statistics</h2>
        <Button 
          onClick={refreshStats} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.length > 0 ? (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsTabContent;
