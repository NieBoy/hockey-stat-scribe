
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayerStatsData } from "@/hooks/players/usePlayerStatsData";
import PlayerStatsHeader from "./components/PlayerStatsHeader";
import StatsContent from "./components/StatsContent";
import PlayerStatsDebug from "./components/PlayerStatsDebug";

interface PlayerStatsContentProps {
  playerId: string;
}

const PlayerStatsContent = ({ playerId }: PlayerStatsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showDebug, setShowDebug] = useState(false);
  
  const { 
    stats, 
    statsLoading, 
    statsError,
    rawGameStats,
    playerGameEvents,
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
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (statsError) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-red-500">
            {statsError.message || "Error loading stats"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <PlayerStatsHeader 
          onRefresh={handleRefresh}
          isRefreshing={statsLoading}
          onToggleDebug={() => setShowDebug(!showDebug)}
          showDebugInfo={showDebug}
        />

        <StatsContent 
          stats={stats || []}
          rawGameStats={rawGameStats || []}
          playerGameEvents={playerGameEvents || []}
          teamGames={teamGames || []}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {showDebug && (
          <PlayerStatsDebug 
            playerId={playerId}
            stats={stats || []}
            onRefresh={handleRefresh}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerStatsContent;
