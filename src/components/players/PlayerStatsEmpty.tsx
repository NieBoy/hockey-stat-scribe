
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PlayerStatsEmptyProps {
  gameStatsDebug: any[];
  playerGameEvents: any[] | undefined;
  onRefresh: () => void;
}

export default function PlayerStatsEmpty({ 
  gameStatsDebug, 
  playerGameEvents,
  onRefresh 
}: PlayerStatsEmptyProps) {
  
  const handleRefreshClick = () => {
    console.log("Calculate Stats button clicked");
    // Add a small delay to ensure the click is registered
    setTimeout(() => {
      console.log("Executing onRefresh callback");
      onRefresh();
    }, 10);
  };

  return (
    <div className="text-center text-muted-foreground">
      <p>No statistics available for this player.</p>
      <p className="mt-2 text-sm">This could mean:</p>
      <ul className="list-disc list-inside mt-1 text-sm">
        <li>The player hasn't participated in any games</li>
        <li>No stats have been recorded for this player</li>
        <li>Stats need to be refreshed from game data</li>
      </ul>
      
      {gameStatsDebug && gameStatsDebug.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
          <p className="font-medium mb-2">Debug Information:</p>
          <p>Found {gameStatsDebug.length} raw game stats for this player that need to be processed.</p>
          <p className="mt-2">Try clicking the "Calculate Stats" button below to calculate statistics from game data.</p>
        </div>
      )}
      
      {playerGameEvents && playerGameEvents.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
          <p className="font-medium mb-2">Game Events Found:</p>
          <p>Found {playerGameEvents.length} game events for this player, but they haven't been processed into stats yet.</p>
          <p className="mt-2">Click the button below to create stats from these events.</p>
        </div>
      )}

      <div className="mt-4">
        <Button 
          onClick={handleRefreshClick} 
          className="gap-2"
          disabled={!playerGameEvents || playerGameEvents.length === 0}
        >
          <RefreshCw className="h-4 w-4" />
          Calculate Stats from Game Data
          {(!playerGameEvents || playerGameEvents.length === 0) && " (No Events Found)"}
        </Button>
      </div>
    </div>
  );
}
