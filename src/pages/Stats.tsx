
import MainLayout from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ColumnDef } from "@tanstack/react-table";
import { PlayerStat } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAllPlayerStats, refreshAllPlayerStats } from "@/services/stats/playerStatsService";

// Helper function to make stat types more readable
const formatStatType = (statType: string): string => {
  switch(statType) {
    case 'goals': return 'Goals';
    case 'assists': return 'Assists';
    case 'faceoffs': return 'Faceoffs';
    case 'hits': return 'Hits';
    case 'penalties': return 'Penalties';
    case 'saves': return 'Saves';
    case 'plusMinus': return 'Plus/Minus';
    default: return statType;
  }
};

// Helper to get stat color based on the statType
const getStatTypeColor = (statType: string): string => {
  switch(statType) {
    case 'goals': return 'bg-red-100 text-red-800';
    case 'assists': return 'bg-blue-100 text-blue-800';
    case 'faceoffs': return 'bg-amber-100 text-amber-800';
    case 'hits': return 'bg-purple-100 text-purple-800';
    case 'penalties': return 'bg-orange-100 text-orange-800';
    case 'saves': return 'bg-green-100 text-green-800';
    case 'plusMinus': return 'bg-sky-100 text-sky-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Stats() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['playerStats'],
    queryFn: getAllPlayerStats,
  });
  
  const handleRefreshAllStats = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllPlayerStats();
      toast({
        title: "Stats Refreshed",
        description: "All player statistics have been recalculated."
      });
      // Refetch the stats after recalculation
      await refetch();
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh statistics."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const columns: ColumnDef<PlayerStat>[] = [
    {
      accessorKey: "playerId",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.original.playerId;
        const playerName = row.original.playerName || 'Unknown Player';
        return <a href={`/players/${playerId}/stats`} className="text-primary hover:underline">{playerName}</a>;
      },
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => (
        <Badge className={getStatTypeColor(row.original.statType)}>
          {formatStatType(row.original.statType)}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Total",
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games",
    },
    {
      accessorKey: "average",
      header: "Average",
      cell: ({ row }) => {
        const average = row.original.gamesPlayed > 0 
          ? (row.original.value / row.original.gamesPlayed).toFixed(2) 
          : "0.00";
        return average;
      },
    },
  ];

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
          <div className="mt-4">
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
            <p className="text-muted-foreground">View and analyze player performance</p>
          </div>
          <Button 
            onClick={handleRefreshAllStats} 
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All Stats
          </Button>
        </div>

        {stats && stats.length > 0 ? (
          <Card>
            <DataTable
              columns={columns}
              data={stats}
              searchKey="playerName"
            />
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <h2 className="text-xl font-semibold mb-2">No Stats Available</h2>
            <p className="mb-6">No player statistics were found. This could be because:</p>
            <ul className="list-disc list-inside mb-6 text-left max-w-md mx-auto">
              <li>No games have been played yet</li>
              <li>No stats have been recorded during games</li>
              <li>Stats need to be recalculated from game data</li>
            </ul>
            <Button onClick={handleRefreshAllStats} disabled={isRefreshing}>
              Calculate Stats from Game Data
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
