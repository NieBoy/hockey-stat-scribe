
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";

interface PlayerStatsEmptyProps {
  playerId: string;
  playerName?: string;
  onRefresh?: () => void;
}

const PlayerStatsEmpty = ({ playerId, playerName = "Player", onRefresh }: PlayerStatsEmptyProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Player Statistics
          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              variant="outline"
              size="sm" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Activity className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No Statistics Available</h3>
          <p className="text-muted-foreground max-w-sm">
            {playerName} doesn't have any recorded statistics yet. 
            Statistics will appear here after participating in games.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsEmpty;
