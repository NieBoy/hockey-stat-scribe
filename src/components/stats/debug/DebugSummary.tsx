
import { Card } from "@/components/ui/card";

interface DebugSummaryProps {
  gameCount: number;
  playerCount: number;
  rawGameStats: any[];
  playerStats: any[];
}

export default function DebugSummary({
  gameCount,
  playerCount,
  rawGameStats,
  playerStats
}: DebugSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-slate-100 p-4 rounded">
        <h3 className="font-medium mb-2">Summary</h3>
        <ul className="list-disc list-inside">
          <li>Total Games: {gameCount}</li>
          <li>Total Players: {playerCount}</li>
          <li>Raw Game Stats: {rawGameStats.length}</li>
          <li>Player Stats: {playerStats.length}</li>
        </ul>
      </div>
      <div className="bg-slate-100 p-4 rounded">
        <h3 className="font-medium mb-2">Processed Stats</h3>
        <p>{playerStats?.length || 0} total processed stats found</p>
      </div>
    </div>
  );
}
