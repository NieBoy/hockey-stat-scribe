
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerStatsDebug from "./PlayerStatsDebug";
import PlayerStatsEmpty from "./PlayerStatsEmpty";
import { Game, User } from "@/types";

// Create a simplified game type that matches what we get from the API
interface SimpleGame {
  id: string;
  date: string;
  home_team_id?: string;
  away_team_id?: string;
  location: string;
}

interface PlayerStatsContentProps {
  stats: any[];
  showDebugInfo?: boolean;
  player: User | null;
  playerTeam: any;
  teamGames: SimpleGame[]; // Update the type to match what we actually receive
  rawGameStats: any[];
  playerGameEvents: any[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  playerId: string;
  hasRawGameStats?: boolean;
  hasGameEvents?: boolean;
}

const PlayerStatsContent = ({ 
  stats,
  showDebugInfo = false,
  player,
  playerTeam,
  teamGames,
  rawGameStats,
  playerGameEvents,
  onRefresh,
  isRefreshing = false,
  playerId,
  hasRawGameStats = false,
  hasGameEvents = false
}: PlayerStatsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const hasStats = stats && stats.length > 0;

  // Show overview tab by default if stats exist, otherwise show debug tab
  useEffect(() => {
    if (!hasStats && (showDebugInfo || hasRawGameStats || hasGameEvents)) {
      setActiveTab("debug");
    }
  }, [hasStats, showDebugInfo, hasRawGameStats, hasGameEvents]);

  if (!hasStats) {
    return (
      <PlayerStatsEmpty 
        gameStatsDebug={rawGameStats || []} 
        playerGameEvents={playerGameEvents}
        onRefresh={onRefresh}
        playerId={playerId}
        hasRawGameStats={hasRawGameStats}
        hasGameEvents={hasGameEvents}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Detailed Stats</TabsTrigger>
        <TabsTrigger value="debug" className={showDebugInfo ? "" : "hidden"}>Debug Info</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Player Statistics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <h3 className="font-semibold text-lg">{stat.statType}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.gamesPlayed} games - {(stat.value / (stat.gamesPlayed || 1)).toFixed(2)} avg
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="details" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Detailed statistics view coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="debug" className="mt-4">
        <PlayerStatsDebug
          player={player}
          teamGames={teamGames}
          playerTeam={playerTeam}
          rawGameStats={rawGameStats}
          playerGameEvents={playerGameEvents}
          stats={[]}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PlayerStatsContent;
