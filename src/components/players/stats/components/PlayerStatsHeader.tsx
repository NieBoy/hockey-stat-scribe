
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {playerName ? `${playerName}'s Stats` : "Player Statistics"} 
        </h1>
        <p className="text-muted-foreground text-sm">
          View and analyze performance statistics
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch 
            id="show-debug"
            checked={showDebugInfo}
            onCheckedChange={onToggleDebug}
          />
          <Label htmlFor="show-debug">Debug Mode</Label>
        </div>
        <Button 
          onClick={onRefresh} 
          variant="outline"
          size="sm" 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
