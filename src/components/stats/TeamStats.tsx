
import { User, StatType, GameStat } from "@/types";
import StatTypeSection from "./StatTypeSection";

interface TeamStatsProps {
  players: User[];
  statTypes: StatType[];
  stats: GameStat[];
  period: number;
  getTeamName: (playerId: string) => string;
  onStatRecorded: (playerId: string, statType: StatType, value: number) => void;
}

export default function TeamStats({
  players,
  statTypes,
  stats,
  period,
  getTeamName,
  onStatRecorded
}: TeamStatsProps) {
  return (
    <div className="space-y-6">
      {statTypes.map((statType) => (
        <StatTypeSection
          key={statType}
          statType={statType}
          players={players}
          stats={stats.filter(s => s.statType === statType && s.period === period)}
          getTeamName={getTeamName}
          onStatRecorded={(playerId, value) => onStatRecorded(playerId, statType, value)}
          showWonLost={statType === 'faceoffs'}
        />
      ))}
    </div>
  );
}
