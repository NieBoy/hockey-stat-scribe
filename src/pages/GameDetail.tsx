import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import GameStats from "@/components/stats/GameStats";
import { Game } from "@/types";
import { useGameStats } from "@/hooks/useGameStats";
import GameStatsList from "@/components/stats/GameStatsList";
import StatTracker from "@/components/stats/StatTracker";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGameTrackers } from "@/hooks/useGameTrackers";
import { useGameEvents } from "@/hooks/useGameEvents";
import GameEventsTimeline from "@/components/events/GameEventsTimeline";
import GameEventButtons from "@/components/events/GameEventButtons";
import { useGamePeriods } from "@/hooks/useGamePeriods";
import { useGameStatus } from "@/hooks/useGameStatus";
import GameStatusControls from "@/components/games/GameStatusControls";
import GameScoreDisplay from "@/components/games/GameScoreDisplay";
import { useGameScore } from "@/hooks/useGameScore";
import AdvancedStatsView from "@/components/stats/advanced-stats/AdvancedStatsView";
import { ensureGameCompatibility } from "@/utils/typeConversions";

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [statType, setStatType] = useState<"basic" | "advanced">("basic");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["games", gameId],
    queryFn: () => getGameById(gameId || ""),
    enabled: !!gameId,
  });

  const { gameStats, handleStatRecorded, handleStatDeleted } = useGameStats(gameId || "");
  const { isTracker, statTypes } = useGameTrackers(gameId || "", user?.id);
  const { events, addEvent } = useGameEvents(gameId || "");
  const { currentPeriod, setCurrentPeriod } = useGamePeriods(data);
  const { isActive, toggleGameStatus, gameStatus } = useGameStatus(gameId || "", data?.is_active);
  const { homeScore, awayScore } = useGameScore(gameId || "");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Game not found</p>
          <Button onClick={() => navigate("/games")} className="mt-4">
            Back to Games
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Ensure the game data has all required fields
  const gameData = ensureGameCompatibility(data);

  const handleGoBack = () => {
    navigate("/games");
  };

  const handlePeriodChange = (period: number) => {
    setCurrentPeriod(period);
  };

  const handleToggleGameStatus = async () => {
    const success = await toggleGameStatus();
    if (success) {
      refetch();
    }
  };

  const handleStartGame = async () => {
    const success = await toggleGameStatus();
    if (success) refetch();
  };

  const handleStopGame = async () => {
    const success = await toggleGameStatus();
    if (success) refetch();
  };

  const handleEndPeriod = async () => {
    // This would need actual implementation
    console.log("End period requested");
  };

  const formattedDate = data.date ? format(new Date(data.date), "MMMM d, yyyy") : "Unknown date";

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {gameData.homeTeam?.name} vs {gameData.awayTeam?.name || gameData.opponent_name}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-1">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {formattedDate}
              </div>
              {gameData.location && (
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {gameData.location}
                </div>
              )}
            </div>
          </div>

          <GameScoreDisplay
            gameId={gameId}
            game={gameData}
          />
        </div>

        <GameStatusControls
          status={gameStatus || 'not-started'}
          period={currentPeriod || 1}
          isActive={isActive}
          currentPeriod={currentPeriod}
          totalPeriods={gameData.periods || 3}
          onPeriodChange={handlePeriodChange}
          onToggleStatus={handleToggleGameStatus}
          onStartGame={handleStartGame}
          onStopGame={handleStopGame}
          onEndPeriod={handleEndPeriod}
        />
      </div>

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
              <Button
                variant={statType === "basic" ? "default" : "outline"}
                onClick={() => setStatType("basic")}
              >
                Basic Stats
              </Button>
              <Button
                variant={statType === "advanced" ? "default" : "outline"}
                onClick={() => setStatType("advanced")}
              >
                Advanced Stats
              </Button>
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
    </div>
  );
}
