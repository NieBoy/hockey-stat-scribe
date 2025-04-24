
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Team } from "@/types";
import { useTeamStatsData } from "@/hooks/teams/useTeamStatsData";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCw, ChevronRight, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import TeamStatsDebug from "./TeamStatsDebug";
import StatsSystemDebug from "@/components/stats/debug/StatsSystemDebug";

interface TeamStatsProps {
  team: Team;
}

const TeamStats = ({ team }: TeamStatsProps) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const { 
    stats, 
    isLoading, 
    isRefreshing, 
    isReprocessing,
    refreshStatus,
    refreshStats,
    handleReprocessAllStats,
    refetch 
  } = useTeamStatsData(team);
  
  const statsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "playerName",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.original.playerId;
        return (
          <Link 
            to={`/players/${playerId}/stats`}
            className="hover:underline flex items-center gap-1"
          >
            {row.getValue("playerName")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        );
      },
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => {
        const statType = row.getValue("statType");
        return (
          <Badge variant="outline">{String(statType)}</Badge>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => row.getValue("value"),
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games Played",
      cell: ({ row }) => row.getValue("gamesPlayed"),
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
          <CardDescription>Loading stats...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Statistics</h2>
          <p className="text-muted-foreground">
            View and analyze team performance statistics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug className="h-4 w-4" />
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
          <Button 
            onClick={refreshStats}
            disabled={isRefreshing}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      {stats && stats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={statsColumns}
              data={stats}
              filterColumn="playerName"
              filterPlaceholder="Filter by player name..."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No statistics available for this team yet.
              <br />
              Statistics will be available after players participate in games.
            </p>
          </CardContent>
        </Card>
      )}

      {showDebug && (
        <>
          <TeamStatsDebug 
            team={team}
            refreshStatus={refreshStatus}
            onReprocessAllStats={handleReprocessAllStats}
            isReprocessing={isReprocessing}
          />
          
          <StatsSystemDebug 
            teamId={team.id} 
            onProcessingComplete={refetch}
          />
        </>
      )}
    </div>
  );
};

export default TeamStats;
