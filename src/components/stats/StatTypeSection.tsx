
import { StatType, User } from "@/types";
import StatTypeSectionHeader from "./StatTypeSectionHeader";
import StatCardGrid from "./StatCardGrid";

interface StatTypeSectionProps {
  statType: StatType;
  players: User[];
  stats: { playerId: string; value: number }[];
  getTeamName: (playerId: string) => string;
  onStatRecorded: (playerId: string, value: number) => void;
  showWonLost?: boolean;
}

export default function StatTypeSection({
  statType,
  players,
  stats,
  getTeamName,
  onStatRecorded,
  showWonLost = false,
}: StatTypeSectionProps) {
  return (
    <div className="space-y-4">
      <StatTypeSectionHeader title={statType} />
      <StatCardGrid
        players={players}
        stats={stats}
        getTeamName={getTeamName}
        onStatRecorded={onStatRecorded}
        statType={statType}
        showWonLost={showWonLost}
      />
    </div>
  );
}
