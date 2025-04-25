
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayerStatsDebug } from "@/hooks/players/usePlayerStatsDebug";
import PlayerStatsHeader from "./components/PlayerStatsHeader";
import StatsContent from "./components/StatsContent";
import PlayerStatsDebug from "./components/PlayerStatsDebug";

interface PlayerStatsContentProps {
  playerId: string;
}

const PlayerStatsContent = ({ playerId }: PlayerStatsContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { 
    stats, 
    statsLoading, 
    statsError,
    rawGameStats,
    playerGameEvents,
    teamGames,
    playerTeam,
    showDebug,
    toggleDebug,
    handleRefresh,
    isRefreshing,
    refreshStatus
  } = usePlayerStatsDebug(playerId);

  if (statsLoading && !isRefreshing) {
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
          playerName={playerTeam?.name}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onToggleDebug={toggleDebug}
          showDebugInfo={showDebug}
        />

        <StatsContent 
          stats={stats || []}
          rawGameStats={rawGameStats || []}
          playerGameEvents={playerGameEvents || []}
          teamGames={teamGames || []}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          refreshStatus={refreshStatus}
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
