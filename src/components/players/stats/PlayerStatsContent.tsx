
import { Card, CardContent } from "@/components/ui/card";
import PlayerStatsEmpty from "@/components/players/PlayerStatsEmpty";
import PlayerStatsDebug from "@/components/players/PlayerStatsDebug";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { PlayerStat } from "@/types";
import { User } from "@/types";

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
  return (
    <Card>
      <CardContent>
        {stats && stats.length > 0 ? (
          <SortableStatsTable 
            stats={stats} 
            getPlayerName={(playerId) => player?.name || "Player"}
          />
        ) : (
          <PlayerStatsEmpty 
            gameStatsDebug={rawGameStats || []}
            playerGameEvents={playerGameEvents}
            onRefresh={onRefresh}
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
