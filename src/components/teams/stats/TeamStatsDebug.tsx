
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Team } from "@/types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { reprocessAllStats } from "@/services/stats/core/statsRefresh";
import { supabase } from "@/lib/supabase";

interface TeamStatsDebugProps {
  team: Team;
  refreshStatus: Record<string, string>;
  onReprocessAllStats: () => Promise<void>;
  isReprocessing: boolean;
}

const TeamStatsDebug = ({
  team,
  refreshStatus,
  onReprocessAllStats,
  isReprocessing
}: TeamStatsDebugProps) => {
  const [isFixing, setIsFixing] = useState(false);
  
  const fixPlusMinusValues = async () => {
    setIsFixing(true);
    try {
      const playerIds = team.players.map(player => player.id);
      console.log(`Fixing plus/minus values for ${playerIds.length} players`);
      
      // For each player, refresh their stats
      for (const playerId of playerIds) {
        try {
          const { error } = await supabase.rpc('refresh_player_stats', {
            player_id: playerId
          });
          
          if (error) throw error;
        } catch (playerError) {
          console.error(`Error refreshing stats for player ${playerId}:`, playerError);
        }
      }
      
      toast.success("Player plus/minus values have been recalculated");
    } catch (error) {
      console.error("Error fixing plus/minus values:", error);
      toast.error("Failed to fix plus/minus values");
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Stats Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            These tools help diagnose and fix issues with player statistics. Use them with caution.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={isReprocessing || isFixing}
            onClick={onReprocessAllStats}
          >
            <RefreshCw className={`h-4 w-4 ${isReprocessing ? 'animate-spin' : ''}`} />
            Reprocess All Stats
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={isReprocessing || isFixing}
            onClick={fixPlusMinusValues}
          >
            <RefreshCw className={`h-4 w-4 ${isFixing ? 'animate-spin' : ''}`} />
            Fix Plus/Minus Calculations
          </Button>
        </div>
        
        {Object.keys(refreshStatus).length > 0 && (
          <div className="mt-4 bg-muted p-2 rounded text-xs overflow-auto max-h-32">
            <p className="font-semibold mb-1">Processing Status:</p>
            {Object.entries(refreshStatus).map(([playerId, status]) => {
              const player = team.players.find(p => p.id === playerId);
              return (
                <div key={playerId} className="flex justify-between">
                  <span>{player?.name || playerId}</span>
                  <span>{status}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamStatsDebug;
