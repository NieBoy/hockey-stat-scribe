
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayerStatsData } from "@/hooks/players/usePlayerStatsData";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import StatsOverview from "../../../components/stats/StatsOverview";
import StatsDetailView from "../../../components/stats/StatsDetailView";
import GameStatsView from "../../../components/stats/GameStatsView";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerStatsContentProps {
  playerId: string; // This is the team_member.id, not user.id
}

const PlayerStatsContent = ({ playerId }: PlayerStatsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    stats, 
    statsLoading, 
    statsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats,
    refetchEvents
  } = usePlayerStatsData(playerId);

  const handleRefresh = async () => {
    await Promise.all([
      refetchStats(),
      refetchRawStats(),
      refetchEvents()
    ]);
  };

  if (statsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-28" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (statsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            There was an error loading player stats: {statsError.message}
          </p>
          <Button onClick={handleRefresh} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Player Statistics
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              size="sm" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No statistics available for this player yet.
            <br />
            Statistics will be available after participating in games.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Player Statistics 
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="games">Game Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <StatsOverview stats={stats} />
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <StatsDetailView stats={stats} />
          </TabsContent>
          <TabsContent value="games" className="mt-4">
            <GameStatsView 
              gameStats={rawGameStats} 
              gameEvents={playerGameEvents}
              games={teamGames} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsContent;
