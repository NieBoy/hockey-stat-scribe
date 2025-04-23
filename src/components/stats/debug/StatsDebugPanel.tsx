
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DebugSummary from "./DebugSummary";
import DebugDataView from "./DebugDataView";
import { PlayerStat } from "@/types";

interface StatsDebugPanelProps {
  debugData: {
    rawGameStats: any[];
    playerStats: any[];
    gameCount: number;
    playerCount: number;
  };
  stats: PlayerStat[];
}

export default function StatsDebugPanel({ debugData, stats }: StatsDebugPanelProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DebugSummary 
          gameCount={debugData.gameCount}
          playerCount={debugData.playerCount}
          rawGameStats={debugData.rawGameStats}
          playerStats={debugData.playerStats}
        />
        
        <DebugDataView 
          title="Raw Game Stats"
          data={debugData.rawGameStats}
        />
        
        <DebugDataView 
          title="Player Stats Table"
          data={debugData.playerStats}
        />
      </CardContent>
    </Card>
  );
}
