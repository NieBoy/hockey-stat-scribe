
import { Card } from "@/components/ui/card";
import { calculateAggregateValue } from "@/services/stats/utils/statCalculations";

interface DebugSummaryProps {
  gameCount: number;
  playerCount: number;
  rawGameStats: any[];
  playerStats: any[];
  plusMinusStats?: any[];
  playerId?: string;
}

export default function DebugSummary({
  gameCount,
  playerCount,
  rawGameStats,
  playerStats,
  plusMinusStats = [],
  playerId
}: DebugSummaryProps) {
  // Calculate some useful stats for plus/minus
  const plusEvents = plusMinusStats.filter(stat => stat.details === 'plus').length;
  const minusEvents = plusMinusStats.filter(stat => stat.details === 'minus').length;
  
  // If playerId is provided, filter stats for just that player
  const playerFilteredStats = playerId 
    ? rawGameStats.filter(stat => stat.player_id === playerId)
    : rawGameStats;
  
  // Count stats by type
  const statTypeCount: Record<string, number> = {};
  playerFilteredStats.forEach(stat => {
    if (!statTypeCount[stat.stat_type]) {
      statTypeCount[stat.stat_type] = 0;
    }
    statTypeCount[stat.stat_type]++;
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="bg-slate-100 p-4 rounded">
        <h3 className="font-medium mb-2">Overview Summary</h3>
        <ul className="list-disc list-inside">
          <li>Total Games: {gameCount}</li>
          <li>Total Players: {playerCount}</li>
          <li>Raw Game Stats: {playerFilteredStats.length}</li>
          <li>Processed Player Stats: {playerStats.length}</li>
        </ul>
      </div>
      
      <div className="bg-slate-100 p-4 rounded">
        <h3 className="font-medium mb-2">Plus/Minus Analysis</h3>
        <ul className="list-disc list-inside">
          <li>Plus Events: {plusEvents}</li>
          <li>Minus Events: {minusEvents}</li>
          <li>Net Ratio: {plusEvents - minusEvents}</li>
          <li>Total Plus/Minus Records: {plusMinusStats.length}</li>
        </ul>
      </div>
      
      <div className="bg-slate-100 p-4 rounded col-span-1 md:col-span-2">
        <h3 className="font-medium mb-2">Stat Type Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(statTypeCount).map(([type, count]) => (
            <div key={type} className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium">{type}</div>
              <div className="text-sm text-muted-foreground">{count} records</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
