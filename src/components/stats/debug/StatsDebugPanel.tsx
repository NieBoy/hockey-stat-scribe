
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerStat } from "@/types";

interface StatsDebugPanelProps {
  debugData: {
    playerInfo?: any;
    playerStats?: PlayerStat[];
    plusMinusStats?: any[];
    rawGameStats?: any[];
    gameCount?: number;
    playerCount?: number;
  };
  stats?: any[];
  playerId?: string;
  onRefresh?: () => void;
}

const StatsDebugPanel = ({ debugData, stats, playerId, onRefresh }: StatsDebugPanelProps) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm font-medium">Stats Debug Panel</CardTitle>
        <Button 
          onClick={handleRefresh}
          variant="ghost" 
          size="sm"
          className="h-7 w-7 p-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="sr-only">Refresh debug data</span>
        </Button>
      </CardHeader>
      <CardContent className="text-xs">
        <Tabs defaultValue="stats">
          <TabsList className="w-full">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="plusminus">+/- Data</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Debug Player Stats ({debugData.playerStats?.length || 0})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpanded(!expanded)}
                  className="h-6 px-2 py-0 text-xs"
                >
                  {expanded ? "Collapse" : "Expand"}
                </Button>
              </div>
              <pre className={`bg-muted p-2 rounded overflow-auto ${expanded ? 'max-h-96' : 'max-h-32'}`}>
                {JSON.stringify(debugData.playerStats, null, 2)}
              </pre>
              
              <p className="text-muted-foreground mt-2 mb-1">Player Info</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-24">
                {JSON.stringify(debugData.playerInfo, null, 2)}
              </pre>
              
              <p className="text-muted-foreground mt-2 mb-1">Displayed Stats</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-24">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="plusminus">
            <div className="space-y-1 mt-2">
              <p className="text-muted-foreground mb-1">Plus/Minus Stats ({debugData.plusMinusStats?.length || 0})</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(debugData.plusMinusStats, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="raw">
            <div className="space-y-1 mt-2">
              <p className="text-muted-foreground mb-1">Raw Game Stats ({debugData.rawGameStats?.length || 0})</p>
              <pre className="bg-muted p-2 rounded overflow-auto max-h-64">
                {JSON.stringify(debugData.rawGameStats, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground mb-1">Games</div>
                  <div className="font-semibold">{debugData.gameCount || 0}</div>
                </div>
                <div className="bg-muted p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground mb-1">Players</div>
                  <div className="font-semibold">{debugData.playerCount || 0}</div>
                </div>
              </div>
              
              {playerId && (
                <div className="bg-muted p-2 rounded">
                  <div className="text-xs text-muted-foreground mb-1">Player ID</div>
                  <div className="font-mono text-[10px] break-all">{playerId}</div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StatsDebugPanel;
