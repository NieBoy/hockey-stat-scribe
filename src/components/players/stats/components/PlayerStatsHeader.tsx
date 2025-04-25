import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

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
    <div className="flex items-center justify-between">
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
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>
    </div>
  );
}
