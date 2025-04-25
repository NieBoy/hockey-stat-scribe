
import { Button } from "@/components/ui/button";
import { Bug, RefreshCw } from "lucide-react";

interface TeamStatsHeaderProps {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onToggleDebug: () => void;
  debugMode: boolean;
}

export default function TeamStatsHeader({
  onRefresh,
  isRefreshing,
  onToggleDebug,
  debugMode
}: TeamStatsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold tracking-tight">Team Statistics</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onToggleDebug}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Bug className="h-4 w-4" />
          {debugMode ? "Hide Debug" : "Debug Mode"}
        </Button>
        
        <Button 
          onClick={() => onRefresh()} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>
    </div>
  );
}
