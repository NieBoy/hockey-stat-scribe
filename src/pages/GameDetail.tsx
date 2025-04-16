import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CalendarClock, MapPin, Users, BarChart3, Play } from "lucide-react";
import { Game, User, GameStat } from "@/types";
import { mockGames, mockUsers, mockGameStats } from "@/lib/mock-data";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Find the game in mock data
  const game = mockGames.find(g => g.id === id) || mockGames[0];
  const gameStats = mockGameStats.filter(stat => stat.gameId === id);
  
  // Format date and time
  const formattedDate = format(new Date(game.date), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(game.date), "h:mm a");

  // Define columns for player stats table
  const statColumns: ColumnDef<GameStat>[] = [
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
      accessorKey: "period",
      header: "Period",
    },
    {
      accessorKey: "value",
      header: "Value",
    },
    {
      accessorKey: "details",
      header: "Details",
    }
  ];

  // Define columns for tracker assignments table
  const trackerColumns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return role.charAt(0).toUpperCase() + role.slice(1);
      }
    },
    {
      id: "statTypes",
      header: "Assigned Stats",
      cell: ({ row }) => {
        const userId = row.original.id;
        const tracker = game.statTrackers.find(t => t.user.id === userId);
        if (!tracker) return "None";
        return tracker.statTypes.map(t => 
          t.charAt(0).toUpperCase() + t.slice(1)
        ).join(", ");
      }
    },
    {
      id: "actions",
      header: "",
      cell: () => {
        return (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        );
      }
    }
  ];

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to="/games">
            <ChevronLeft className="h-4 w-4" /> Back to Games
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {game.homeTeam.name} vs {game.awayTeam.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                {formattedDate} at {formattedTime}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {game.location}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge variant={game.isActive ? "default" : "secondary"} className="text-md py-1 px-3">
              {game.isActive ? "Active" : "Upcoming"}
            </Badge>
            {game.isActive ? (
              <Button asChild>
                <Link to={`/games/${game.id}/track`}>Track Stats</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to={`/games/${game.id}/manage`}>
                  <Play className="h-4 w-4 mr-2" /> Start Game
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="trackers">Stat Trackers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Home Team</h4>
                    <div className="flex items-center justify-between mt-1 p-2 bg-muted/50 rounded">
                      <span>{game.homeTeam.name}</span>
                      <Badge variant="outline">{game.homeTeam.players.length} Players</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Away Team</h4>
                    <div className="flex items-center justify-between mt-1 p-2 bg-muted/50 rounded">
                      <span>{game.awayTeam.name}</span>
                      <Badge variant="outline">{game.awayTeam.players.length} Players</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Stats Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameStats.length > 0 ? (
                  <div className="space-y-3">
                    {/* Goals */}
                    <div>
                      <h4 className="font-medium">Goals</h4>
                      <div className="mt-1">
                        {mockGameStats.filter(s => s.statType === 'goals').length > 0 ? (
                          mockGameStats
                            .filter(s => s.statType === 'goals')
                            .map(stat => {
                              const player = mockUsers.find(u => u.id === stat.playerId);
                              return (
                                <div key={stat.id} className="flex justify-between p-1">
                                  <span>{player?.name || 'Unknown Player'}</span>
                                  <span className="font-semibold">{stat.value}</span>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-sm text-muted-foreground">No goals recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Assists */}
                    <div>
                      <h4 className="font-medium">Assists</h4>
                      <div className="mt-1">
                        {mockGameStats.filter(s => s.statType === 'assists').length > 0 ? (
                          mockGameStats
                            .filter(s => s.statType === 'assists')
                            .map(stat => {
                              const player = mockUsers.find(u => u.id === stat.playerId);
                              return (
                                <div key={stat.id} className="flex justify-between p-1">
                                  <span>{player?.name || 'Unknown Player'}</span>
                                  <span className="font-semibold">{stat.value}</span>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-sm text-muted-foreground">No assists recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Other stats would go here */}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No stats recorded yet</p>
                    {game.isActive && (
                      <Button size="sm" className="mt-2" asChild>
                        <Link to={`/games/${game.id}/track`}>Start Tracking</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Game Stats</CardTitle>
              <CardDescription>
                All recorded statistics for this game
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gameStats.length > 0 ? (
                <DataTable 
                  columns={statColumns} 
                  data={gameStats}
                  searchKey="playerId"
                />
              ) : (
                <div className="text-center py-10">
                  <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 font-medium">No stats recorded</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start tracking stats when the game begins
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trackers">
          <Card>
            <CardHeader>
              <CardTitle>Stat Trackers</CardTitle>
              <CardDescription>
                Assign people to track different stat categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {game.statTrackers.length > 0 ? (
                <DataTable 
                  columns={trackerColumns} 
                  data={game.statTrackers.map(tracker => tracker.user)}
                />
              ) : (
                <div className="text-center py-10">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 font-medium">No stat trackers assigned</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assign parents or coaches to track specific stats
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Assign Stat Tracker
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
