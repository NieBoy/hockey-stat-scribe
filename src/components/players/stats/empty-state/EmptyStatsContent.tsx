
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Mail, Info, FileSearch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmptyStatsContentProps {
  onRefresh: () => void;
  gameStatsDebug: any[];
  playerGameEvents: any[] | undefined;
  isPlayerValid: boolean;
  hasValidUserId: boolean;
  playerId?: string;
}

export default function EmptyStatsContent({ 
  onRefresh, 
  gameStatsDebug, 
  playerGameEvents,
  isPlayerValid,
  hasValidUserId,
  playerId
}: EmptyStatsContentProps) {
  const [showDebugTips, setShowDebugTips] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Count how many events appear to be goals which could be converted to stats
  const goalEvents = playerGameEvents?.filter(event => 
    event.event_type === 'goal' && 
    (event.details?.playerId === playerId || 
     event.details?.primaryAssistId === playerId || 
     event.details?.secondaryAssistId === playerId)
  )?.length || 0;
  
  // Count events where player is on ice (for plus/minus)
  const onIceEvents = playerGameEvents?.filter(event => 
    event.details?.playersOnIce?.includes(playerId)
  )?.length || 0;

  const handleProcessStats = async () => {
    setIsProcessing(true);
    try {
      await onRefresh();
    } finally {
      setIsProcessing(false);
    }
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
      
      {!isPlayerValid && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-left">
          <div className="flex items-center gap-2 mb-1 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">Player validation error</p>
          </div>
          <p className="text-sm">This player ID doesn't exist in the database or has issues.</p>
        </div>
      )}
      
      {isPlayerValid && !hasValidUserId && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
          <div className="flex items-center gap-2 mb-1 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">User ID missing</p>
          </div>
          <p className="text-sm">This player exists but doesn't have a user ID assigned. This is required for stats processing and can be fixed by:</p>
          <ul className="list-disc list-inside mt-1 text-xs text-yellow-700">
            <li>Adding an email address to the player's profile</li>
            <li>Sending an invitation to the player</li>
            <li>Using the "Fix User Association" button on the errors page</li>
          </ul>
        </div>
      )}
      
      {playerGameEvents && playerGameEvents.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
          <div className="flex items-center gap-2 mb-1 text-blue-600">
            <FileSearch className="h-4 w-4" />
            <p className="font-medium">Game Events Found:</p>
          </div>
          <p>Found {playerGameEvents.length} game events for this player that can be processed into stats.</p>
          <ul className="list-disc list-inside mt-1 text-xs text-blue-700">
            <li>{goalEvents} goal-related events (scoring or assists)</li>
            <li>{onIceEvents} events where player was on ice (plus/minus)</li>
            <li>{playerGameEvents.length - goalEvents - onIceEvents} other events</li>
          </ul>
          <p className="mt-2 text-sm">Click the button below to create stats from these events.</p>
        </div>
      )}
      
      {gameStatsDebug && gameStatsDebug.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-left">
          <div className="flex items-center gap-2 mb-1 text-green-600">
            <Info className="h-4 w-4" />
            <p className="font-medium">Raw Game Stats Found:</p>
          </div>
          <p>Found {gameStatsDebug.length} raw game stats that should be aggregated.</p>
          <p className="mt-2 text-sm">If you're seeing this but no aggregated stats appear, try refreshing the stats calculation.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <Button 
          onClick={handleProcessStats} 
          className="gap-2"
          disabled={(!playerGameEvents || playerGameEvents.length === 0) || !isPlayerValid || !hasValidUserId || isProcessing}
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
          {isProcessing ? "Processing..." : "Calculate Stats from Game Data"}
          {(!playerGameEvents || playerGameEvents.length === 0) && " (No Events Found)"}
        </Button>
        
        <Button
          variant="outline" 
          size="sm"
          className="mt-2 text-xs"
          onClick={() => setShowDebugTips(!showDebugTips)}
        >
          <Info className="h-3 w-3 mr-1" />
          {showDebugTips ? "Hide Troubleshooting Tips" : "Show Troubleshooting Tips"}
        </Button>
      </div>

      {showDebugTips && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md text-left text-xs">
          <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-1">
              <Mail className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>
                <strong>Add an email</strong>: Make sure the player has an email address in their profile. This helps with user ID assignment.
              </span>
            </li>
            <li className="flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>
                <strong>Player ID</strong>: {playerId || 'N/A'} 
                {playerId && <span className="block text-muted-foreground">If you see game events but no stats, this ID might be different from what's in the events or the user_id might be missing.</span>}
              </span>
            </li>
            <li className="flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
              <span>
                <strong>Stats Path</strong>: Game events → Game stats → Player stats
                <span className="block text-muted-foreground">Each step must succeed for stats to appear. Check if the calculate function is processing events properly.</span>
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
