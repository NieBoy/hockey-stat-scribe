
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Mail, Info } from "lucide-react";
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
          <p className="text-sm">This player exists but doesn't have a user ID assigned. This is often fixed by:</p>
          <ul className="list-disc list-inside mt-1 text-xs text-yellow-700">
            <li>Adding an email address to the player's profile</li>
            <li>Sending an invitation to the player</li>
            <li>Using the "Fix User Association" button on the errors page</li>
          </ul>
        </div>
      )}
      
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

      <div className="mt-6 flex flex-col items-center gap-2">
        <Button 
          onClick={onRefresh} 
          className="gap-2"
          disabled={(!playerGameEvents || playerGameEvents.length === 0) || !isPlayerValid || !hasValidUserId}
        >
          <RefreshCw className="h-4 w-4" />
          Calculate Stats from Game Data
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
                {playerId && <span className="block text-muted-foreground">If you see game events but no stats, this ID might be different from what's in the events.</span>}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
