
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { mockPlayerStats, mockUsers } from "@/lib/mock-data";

export default function Stats() {
  const [statTab, setStatTab] = useState("players");

  // Define columns for player stats table
  const playerStatsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "playerId",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.getValue("playerId") as string;
        const player = mockUsers.find(u => u.id === playerId);
        return player?.name || "Unknown Player";
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
      header: "Average",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const games = row.getValue("gamesPlayed") as number;
        return (value / games).toFixed(2);
      }
    }
  ];

  // Group stats by player for players tab
  const playerStats = mockPlayerStats;

  // Group stats by team for teams tab (not implemented in mock data yet)
  const teamStats = [];

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Stats</h1>
          <p className="text-muted-foreground">
            View and analyze hockey performance statistics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="players" value={statTab} onValueChange={setStatTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Player Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {playerStats.length > 0 ? (
                <DataTable 
                  columns={playerStatsColumns} 
                  data={playerStats}
                  searchKey="playerId"
                />
              ) : (
                <div className="text-center py-10">
                  <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 font-medium">No stats available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stats will appear here once games are played
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Top Scorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerStats.filter(s => s.statType === 'goals').length > 0 ? (
                  <div className="space-y-4">
                    {playerStats
                      .filter(s => s.statType === 'goals')
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((stat, idx) => {
                        const player = mockUsers.find(u => u.id === stat.playerId);
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">#{idx + 1}</span>
                              <span>{player?.name || 'Unknown Player'}</span>
                            </div>
                            <div className="font-semibold">{stat.value}</div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No goal data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Top Assists
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerStats.filter(s => s.statType === 'assists').length > 0 ? (
                  <div className="space-y-4">
                    {playerStats
                      .filter(s => s.statType === 'assists')
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((stat, idx) => {
                        const player = mockUsers.find(u => u.id === stat.playerId);
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">#{idx + 1}</span>
                              <span>{player?.name || 'Unknown Player'}</span>
                            </div>
                            <div className="font-semibold">{stat.value}</div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No assist data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card className="py-10 text-center">
            <CardContent>
              <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
              <h3 className="mt-2 font-medium">Team Stats Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Team statistics will be available in a future update
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
