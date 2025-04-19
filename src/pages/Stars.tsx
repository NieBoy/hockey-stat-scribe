
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { getPlayerStats } from "@/services/stats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Trophy } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PlayerStat } from "@/types";

export default function Stars() {
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['playerStats'],
    queryFn: getPlayerStats
  });

  const columns = [
    {
      accessorKey: "playerId",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.getValue("playerId");
        return <a href={`/players/${playerId}/stats`} className="text-primary hover:underline">{playerId}</a>;
      }
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => {
        const statType = row.getValue("statType") as string;
        return statType.charAt(0).toUpperCase() + statType.slice(1);
      }
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

  if (isLoading) return <LoadingSpinner />;

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
                value={periodFilter} 
                onValueChange={setPeriodFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="1">Period 1</SelectItem>
                  <SelectItem value="2">Period 2</SelectItem>
                  <SelectItem value="3">Period 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={stats || []}
              searchKey="playerId"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
