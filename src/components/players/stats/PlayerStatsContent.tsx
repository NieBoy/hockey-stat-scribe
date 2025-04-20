
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { PlayerStat, GameStat } from "@/types";
import EmptyStatsContent from "@/components/players/stats/empty-state/EmptyStatsContent";
import PlayerStatsDebug from "@/components/players/PlayerStatsDebug";
import GameStatsFilter from "@/components/stats/GameStatsFilter";

function filterGameStats(
  stats: GameStat[],
  filters: {
    gameId: string,
    period: string,
    statType: string
  }
) {
  return stats.filter(stat => {
    const matchesGame = filters.gameId === "all" || stat.gameId === filters.gameId;
    const matchesPeriod = filters.period === "all" || stat.period?.toString() === filters.period;
    const matchesStatType = filters.statType === "all" || stat.statType === filters.statType;
    return matchesGame && matchesPeriod && matchesStatType;
  });
}

// Group stats by type for better display
function aggregateGameStats(stats: GameStat[]): PlayerStat[] {
  if (!stats || stats.length === 0) return [];
  
  const statsByType = new Map<string, { value: number, gameIds: Set<string> }>();
  
  // First pass: group by stat type
  stats.forEach(stat => {
    const key = stat.statType;
    if (!statsByType.has(key)) {
      statsByType.set(key, { value: 0, gameIds: new Set() });
    }
    const existing = statsByType.get(key)!;
    existing.value += stat.value;
    existing.gameIds.add(stat.gameId);
  });
  
  // Convert to array of PlayerStat objects
  return Array.from(statsByType.entries()).map(([statType, data]) => ({
    playerId: stats[0].playerId, // All stats are for the same player
    statType: statType as any,
    value: data.value,
    gamesPlayed: data.gameIds.size,
    playerName: 'Player' // Will be set by SortableStatsTable
  }));
}

interface PlayerStatsContentProps {
  stats: PlayerStat[];
  showDebugInfo: boolean;
  player: any | null;
  playerTeam: any;
  teamGames: any[];
  rawGameStats: GameStat[];
  playerGameEvents: any[];
  onRefresh: () => void;
  playerId: string;
}

export default function PlayerStatsContent({
  stats,
  showDebugInfo,
  player,
  playerTeam,
  teamGames,
  rawGameStats,
  playerGameEvents,
  onRefresh,
  playerId
}: PlayerStatsContentProps) {
  const [gameId, setGameId] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [statType, setStatType] = useState<string>("all");

  // Process games data for the filter dropdown
  const games = useMemo(
    () =>
      [...new Map(
        rawGameStats.map((g) => [g.gameId, { 
          id: g.gameId, 
          date: (() => {
            const match = teamGames?.find(tm => tm.id === g.gameId);
            if (match) return match.date;
            return new Date().toISOString();
          })() 
        }])
      ).values()],
    [rawGameStats, teamGames]
  );

  // Filter raw game stats based on selected filters
  const filteredRawStats = useMemo(() => 
    filterGameStats(rawGameStats, { gameId, period, statType }),
  [rawGameStats, gameId, period, statType]);
  
  // Aggregate filtered stats for display
  const aggregatedStats = useMemo(() => 
    aggregateGameStats(filteredRawStats),
  [filteredRawStats]);

  const hasRawGameStats = rawGameStats && rawGameStats.length > 0;
  const isPlayerValid = !!player;
  const hasValidUserId = !!player?.id;
  const hasGameEvents = playerGameEvents && playerGameEvents.length > 0;

  return (
    <Card>
      <CardContent className="py-6">
        {hasRawGameStats && (
          <div className="mb-4">
            <GameStatsFilter
              stats={rawGameStats}
              players={player ? [player] : []}
              games={games}
              onFilter={() => {
                // All logic handled by local state
              }}
              // Use controlled props for the filter
              gameId={gameId}
              onGameIdChange={setGameId}
              period={period}
              onPeriodChange={setPeriod}
              statType={statType}
              onStatTypeChange={setStatType}
              hidePlayerFilter={true} // Hide player filter as this is a single player view
            />
          </div>
        )}

        {filteredRawStats && filteredRawStats.length > 0 ? (
          <>
            {/* Display aggregated stats (grouped by stat type) */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Aggregated Stats</h3>
              <SortableStatsTable
                stats={aggregatedStats}
                getPlayerName={() => player?.name || "Player"}
              />
            </div>
            
            {/* Display individual game stats */}
            <div>
              <h3 className="text-lg font-medium mb-2">Individual Game Stats</h3>
              <SortableStatsTable
                stats={filteredRawStats.map(stat => ({
                  playerId: stat.playerId,
                  statType: stat.statType,
                  value: stat.value,
                  gamesPlayed: 1,
                  playerName: player?.name || 'Player'
                }))}
                getPlayerName={() => player?.name || "Player"}
              />
            </div>
          </>
        ) : (
          <EmptyStatsContent
            gameStatsDebug={rawGameStats || []}
            playerGameEvents={playerGameEvents}
            onRefresh={onRefresh}
            isPlayerValid={isPlayerValid}
            hasValidUserId={hasValidUserId}
            playerId={playerId}
            hasRawGameStats={hasRawGameStats}
            hasGameEvents={hasGameEvents}
          />
        )}
        
        {showDebugInfo && (
          <PlayerStatsDebug
            player={player}
            playerTeam={playerTeam}
            teamGames={teamGames || []}
            rawGameStats={rawGameStats || []}
            playerGameEvents={playerGameEvents || []}
            stats={stats || []}
          />
        )}
      </CardContent>
    </Card>
  );
}
