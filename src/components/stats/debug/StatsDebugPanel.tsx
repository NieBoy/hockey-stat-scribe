
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DebugSummary from "./DebugSummary";
import DebugDataView from "./DebugDataView";
import { PlayerStat } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StatsDebugPanelProps {
  debugData: {
    rawGameStats: any[];
    playerStats: any[];
    gameCount: number;
    playerCount: number;
    plusMinusStats?: any[];
  };
  stats: PlayerStat[];
  onRefresh?: () => Promise<void>;
  playerId?: string;
}

export default function StatsDebugPanel({ 
  debugData, 
  stats,
  onRefresh,
  playerId
}: StatsDebugPanelProps) {
  const [activeTab, setActiveTab] = useState("summary");
  
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stats Debug Information</CardTitle>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" /> Refresh Debug
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="rawgame">Raw Game Stats</TabsTrigger>
            <TabsTrigger value="plusminus">Plus/Minus Details</TabsTrigger>
            <TabsTrigger value="aggregated">Aggregated Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <DebugSummary 
              gameCount={debugData.gameCount}
              playerCount={debugData.playerCount}
              rawGameStats={debugData.rawGameStats}
              playerStats={debugData.playerStats}
              plusMinusStats={debugData.plusMinusStats || []}
              playerId={playerId}
            />
          </TabsContent>
          
          <TabsContent value="rawgame" className="mt-4">
            <DebugDataView 
              title="Raw Game Stats"
              data={debugData.rawGameStats}
              maxItems={20}
            />
          </TabsContent>
          
          <TabsContent value="plusminus" className="mt-4">
            <DebugDataView 
              title="Plus/Minus Details"
              data={debugData.plusMinusStats || []}
              maxItems={20}
            />
          </TabsContent>
          
          <TabsContent value="aggregated" className="mt-4">
            <DebugDataView 
              title="Aggregated Player Stats"
              data={debugData.playerStats}
              maxItems={20}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
