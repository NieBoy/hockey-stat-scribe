
import { Button } from "@/components/ui/button";
import { RefreshCw, Bug } from "lucide-react";

interface PlayerStatsHeaderProps {
  playerName?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleDebug: () => void;
  showDebugInfo: boolean;
}

export default function PlayerStatsHeader({
  playerName,
  onRefresh,
  isRefreshing,
  onToggleDebug,
  showDebugInfo
}: PlayerStatsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {playerName || "Player"}'s Statistics
        </h1>
        <p className="text-muted-foreground">
          View and analyze performance statistics
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
        <Button
          variant="outline"
          onClick={onToggleDebug}
          className="gap-2"
        >
          <Bug className="h-4 w-4" />
          {showDebugInfo ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
    </div>
  );
}
