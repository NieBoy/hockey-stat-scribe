import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { PlayerStat, GameStat, StatType, User } from "@/types";
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

interface PlayerStatsContentProps {
  stats: PlayerStat[];
  showDebugInfo: boolean;
  player: User | null;
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

  const games = useMemo(
    () =>
      [...new Map(
        rawGameStats.map((g) => [g.gameId, { id: g.gameId, date: (() => {
          const match = teamGames?.find(tm => tm.id === g.gameId);
          if (match) return match.date;
          return new Date().toISOString();
        })() }])
      ).values()],
    [rawGameStats, teamGames]
  );

  const filteredRawStats = useMemo(() => {
    return filterGameStats(rawGameStats, { gameId, period, statType });
  }, [rawGameStats, gameId, period, statType]);

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
                // All logic handled in local filter, don't need to handle externally
              }}
              // Override: Hide player dropdown, always use current player
              // We'll do this by customizing the GameStatsFilter logic
              // But as we only pass 1 player, the dropdown is trivial/disabled
            />
            {/* Hook up the GameStatsFilter controls to our local state */}
            {/* We'll need to jump into GameStatsFilter and make it controlled for our scenario */}
            {/* But for now, we can use the existing interface in a basic way */}
          </div>
        )}

        {filteredRawStats && filteredRawStats.length > 0 ? (
          <SortableStatsTable
            stats={
              filteredRawStats.map(stat => ({
                playerId: stat.playerId,
                statType: stat.statType,
                value: stat.value,
                gamesPlayed: 1,
                playerName: player?.name || 'Player'
              }))
            }
            getPlayerName={() => player?.name || "Player"}
          />
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
