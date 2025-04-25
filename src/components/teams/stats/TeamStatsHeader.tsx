
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

interface TeamStatsHeaderProps {
  onToggleDebug: () => void;
  debugMode: boolean;
  isRefreshing?: boolean;
}

export default function TeamStatsHeader({
  onToggleDebug,
  debugMode,
  isRefreshing
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
      </div>
    </div>
  );
}
