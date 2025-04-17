
import { StatType, User } from "@/types";
import StatCard from "./StatCard";

interface StatCardGridProps {
  players: User[];
  stats: { playerId: string; value: number }[];
  getTeamName: (playerId: string) => string;
  onStatRecorded: (playerId: string, value: number) => void;
  statType: StatType;
  showWonLost?: boolean;
}

export default function StatCardGrid({
  players,
  stats,
  getTeamName,
  onStatRecorded,
  statType,
  showWonLost = false,
}: StatCardGridProps) {
  const getPlayerStats = (playerId: string) => {
    return stats.filter(s => s.playerId === playerId).reduce((acc, stat) => acc + stat.value, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {players.map(player => (
        <StatCard
          key={`${statType}-${player.id}`}
          playerId={player.id}
          playerName={player.name}
          teamName={getTeamName(player.id)}
          statType={statType}
          currentValue={getPlayerStats(player.id)}
          onRecord={(value) => onStatRecorded(player.id, value)}
          showWonLost={showWonLost}
        />
      ))}
    </div>
  );
}
