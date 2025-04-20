
import { Card, CardContent } from "@/components/ui/card";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { PlayerStat } from "@/types";
import { User } from "@/types";
import EmptyStatsContent from "@/components/players/stats/empty-state/EmptyStatsContent";
import PlayerStatsDebug from "@/components/players/PlayerStatsDebug";

interface PlayerStatsContentProps {
  stats: PlayerStat[];
  showDebugInfo: boolean;
  player: User | null;
  playerTeam: any;
  teamGames: any[];
  rawGameStats: any[];
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
  // Check if player has a valid user ID
  const isPlayerValid = !!player;
  const hasValidUserId = !!player?.id;

  return (
    <Card>
      <CardContent className="py-6">
        {stats && stats.length > 0 ? (
          <SortableStatsTable 
            stats={stats} 
            getPlayerName={(playerId) => player?.name || "Player"}
          />
        ) : (
          <EmptyStatsContent 
            gameStatsDebug={rawGameStats || []}
            playerGameEvents={playerGameEvents}
            onRefresh={onRefresh}
            isPlayerValid={isPlayerValid}
            hasValidUserId={hasValidUserId}
            playerId={playerId}
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
