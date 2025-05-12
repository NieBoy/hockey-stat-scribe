
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GameEventsTimeline from "@/components/events/GameEventsTimeline";
import GameStats from "@/components/stats/GameStats";
import AdvancedStatsView from "@/components/stats/advanced-stats/AdvancedStatsView";
import GameEventButtons from "@/components/events/GameEventButtons";
import StatTracker from "@/components/stats/StatTracker";
import GameStatsList from "@/components/stats/GameStatsList";
import { Game, GameEvent, GameStat } from "@/types";

interface GameDetailTabsProps {
  gameId?: string;
  gameData: Game;
  isTracker: boolean;
  statTypes: string[];
  events: GameEvent[];
  gameStats: GameStat[];
  currentPeriod: number;
  addEvent: (event: Partial<GameEvent>) => Promise<any>;
  handleStatRecorded: (stat: Omit<GameStat, 'id' | 'timestamp'>) => Promise<void>;
  handleStatDeleted: (statId: string) => Promise<void>;
}

export default function GameDetailTabs({
  gameId,
  gameData,
  isTracker,
  statTypes,
  events,
  gameStats,
  currentPeriod,
  addEvent,
  handleStatRecorded,
  handleStatDeleted,
}: GameDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [statType, setStatType] = useState<"basic" | "advanced">("basic");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        {isTracker && <TabsTrigger value="track">Track Stats</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Game Overview</CardTitle>
            <CardDescription>
              {gameData.homeTeam.name} vs {gameData.awayTeam.name || gameData.opponent_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Home Team</h3>
                <p>{gameData.homeTeam.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {gameData.homeTeam.players?.length || 0} players
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Away Team</h3>
                <p>{gameData.awayTeam.name || gameData.opponent_name || "Unknown Opponent"}</p>
                {gameData.awayTeam.players && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {gameData.awayTeam.players?.length || 0} players
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <GameEventsTimeline events={events} game={gameData} />
      </TabsContent>

      <TabsContent value="stats">
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statType === "basic" ? "bg-primary text-primary-foreground" : "bg-transparent border border-input"
              }`}
              onClick={() => setStatType("basic")}
            >
              Basic Stats
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statType === "advanced" ? "bg-primary text-primary-foreground" : "bg-transparent border border-input"
              }`}
              onClick={() => setStatType("advanced")}
            >
              Advanced Stats
            </button>
          </div>
        </div>

        {statType === "basic" ? (
          <GameStats gameId={gameId || ""} />
        ) : (
          <AdvancedStatsView game={gameData} />
        )}
      </TabsContent>

      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>Game Events</CardTitle>
            <CardDescription>Record goals and other game events</CardDescription>
          </CardHeader>
          <CardContent>
            <GameEventButtons
              game={gameData}
              period={currentPeriod}
              onEventAdded={addEvent}
            />
          </CardContent>
        </Card>

        <GameEventsTimeline events={events} game={gameData} />
      </TabsContent>

      {isTracker && (
        <TabsContent value="track">
          <StatTracker
            game={gameData}
            statTypes={statTypes}
            onStatRecorded={handleStatRecorded}
            existingStats={gameStats}
          />

          <GameStatsList
            gameStats={gameStats}
            game={gameData}
            onDelete={handleStatDeleted}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
