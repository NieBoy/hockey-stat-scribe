
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { getPlayerStats } from "@/services/stats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Trophy } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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

export default function Stars() {
  const [statTypeFilter, setStatTypeFilter] = useState<string>("all");
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['playerStats'],
    queryFn: getPlayerStats
  });

  // Filter stats by type if needed
  const filteredStats = statTypeFilter === "all" 
    ? stats 
    : stats?.filter(stat => stat.statType === statTypeFilter);

  const columns = [
    {
      accessorKey: "playerName",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.original.playerId;
        const playerName = row.original.playerName || 'Unknown Player';
        return <Link to={`/players/${playerId}/stats`} className="text-primary hover:underline">{playerName}</Link>;
      }
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => (
        <Badge className={getStatTypeColor(row.original.statType)}>
          {formatStatType(row.original.statType)}
        </Badge>
      )
    },
    {
      accessorKey: "value",
      header: "Total",
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games Played",
    },
    {
      id: "average",
      header: "Per Game Average",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const games = row.getValue("gamesPlayed") as number;
        return games > 0 ? (value / games).toFixed(2) : "0.00";
      }
    }
  ];

  if (isLoading) return (
    <MainLayout>
      <LoadingSpinner />
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-8 w-8" />
              Stars
            </h1>
            <p className="text-muted-foreground">
              View and compare player statistics
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Player Statistics</CardTitle>
              <Select 
                value={statTypeFilter} 
                onValueChange={setStatTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by stat type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stats</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="assists">Assists</SelectItem>
                  <SelectItem value="faceoffs">Faceoffs</SelectItem>
                  <SelectItem value="hits">Hits</SelectItem>
                  <SelectItem value="penalties">Penalties</SelectItem>
                  <SelectItem value="saves">Saves</SelectItem>
                  <SelectItem value="plusMinus">Plus/Minus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStats && filteredStats.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={filteredStats}
                searchKey="playerName"
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p>No statistics found {statTypeFilter !== "all" ? `for ${formatStatType(statTypeFilter)}` : ""}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
