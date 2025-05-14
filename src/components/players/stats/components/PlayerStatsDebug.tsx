
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Trash2 } from "lucide-react";
import { resetPlayerPlusMinusStats } from "@/services/stats/core/gameEventProcessor";
import { toast } from "sonner";
import { refreshPlayerStats } from "@/services/stats/playerStatsService";

interface PlayerStatsDebugProps {
  playerId: string;
  stats: any[];
  onRefresh?: () => void;
}

const PlayerStatsDebug = ({ playerId, stats, onRefresh }: PlayerStatsDebugProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<boolean>(false);
  
  // Find the plus/minus stat if it exists
  const plusMinusStat = stats.find(stat => stat.statType === 'plusMinus' || stat.stat_type === 'plusMinus');
  
  const handleResetPlusMinus = async () => {
    if (!playerId) return;
    
    setIsResetting(true);
    setResetMessage("Resetting plus/minus data...");
    setResetError(false);
    
    try {
      console.log(`Starting plus/minus reset for player ${playerId}`);
      
      // Reset the plus/minus stats
      const success = await resetPlayerPlusMinusStats(playerId);
      
      if (success) {
        setResetMessage("Plus/minus data has been reset successfully.");
        toast.success("Plus/minus stats have been reset");
        console.log("Plus/minus reset successful");
        
        // Refresh the player stats
        await refreshPlayerStats(playerId);
        
        // Trigger parent refresh if provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setResetMessage("Failed to reset plus/minus data.");
        setResetError(true);
        toast.error("Failed to reset plus/minus stats");
        console.error("Reset operation returned false");
      }
    } catch (error) {
      console.error("Error resetting plus/minus stats:", error);
      setResetMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setResetError(true);
      toast.error("Error resetting plus/minus stats");
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Plus/Minus Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded">
          <div className="text-xs font-semibold mb-1">Current Plus/Minus Status:</div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Current Value:</span>
            <span className={`font-medium ${
              plusMinusStat && plusMinusStat.value > 0 ? 'text-green-500' : 
              plusMinusStat && plusMinusStat.value < 0 ? 'text-red-500' : ''
            }`}>
              {plusMinusStat ? 
                (plusMinusStat.value > 0 ? `+${plusMinusStat.value}` : plusMinusStat.value) : 
                'No data'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs">Games Tracked:</span>
            <span className="font-medium">
              {plusMinusStat ? plusMinusStat.gamesPlayed || plusMinusStat.games_played || 0 : 0}
            </span>
          </div>
        </div>
        
        <Button
          variant="destructive"
          size="sm"
          disabled={isResetting}
          className="w-full gap-2"
          onClick={handleResetPlusMinus}
        >
          {isResetting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Reset Plus/Minus Data
            </>
          )}
        </Button>
        
        {resetMessage && (
          <Alert variant={resetError ? "destructive" : "default"}>
            <AlertDescription className="text-xs">
              {resetMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerStatsDebug;
