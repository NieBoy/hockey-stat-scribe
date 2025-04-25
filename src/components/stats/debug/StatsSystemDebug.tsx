
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { refreshPlayerStats, reprocessAllStats } from "@/services/stats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StatsSystemDebugProps {
  playerId?: string;
  teamId?: string;
  onProcessingComplete?: () => void;
}

export default function StatsSystemDebug({ playerId, teamId, onProcessingComplete }: StatsSystemDebugProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingResults, setProcessingResults] = useState<Record<string, string>>({});

  // Fetch stats counts
  const { data: statsCounts, refetch: refetchCounts } = useQuery({
    queryKey: ['statsDebugCounts', playerId, teamId],
    queryFn: async () => {
      // Get counts of raw stats and player stats
      const { count: rawCount, error: rawError } = await supabase
        .from('game_stats')
        .select('*', { count: 'exact', head: true });
        
      const { count: playerCount, error: playerError } = await supabase
        .from('player_stats')
        .select('*', { count: 'exact', head: true });
        
      let playerRawCount = 0;
      let teamRawCount = 0;
      
      if (playerId) {
        const { count, error } = await supabase
          .from('game_stats')
          .select('*', { count: 'exact', head: true })
          .eq('player_id', playerId);
          
        playerRawCount = count || 0;
      }
      
      if (teamId) {
        // Get all players in the team
        const { data: teamPlayers, error: teamError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamId);
          
        if (teamPlayers?.length) {
          const playerIds = teamPlayers.map(p => p.id);
          const { count, error } = await supabase
            .from('game_stats')
            .select('*', { count: 'exact', head: true })
            .in('player_id', playerIds);
            
          teamRawCount = count || 0;
        }
      }
      
      return {
        rawCount: rawCount || 0,
        playerCount: playerCount || 0,
        playerRawCount,
        teamRawCount
      };
    }
  });

  const handleReprocessAll = async () => {
    setIsReprocessing(true);
    try {
      await reprocessAllStats();
      toast.success("Stats reprocessing complete");
      await refetchCounts();
      if (onProcessingComplete) onProcessingComplete();
    } catch (error) {
      toast.error("Failed to reprocess stats");
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    const results: Record<string, string> = {};
    
    try {
      if (playerId) {
        // Refresh just this player
        const result = await refreshPlayerStats(playerId);
        results[playerId] = 'Success';
      } else if (teamId) {
        // Get all players in team and refresh each one
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select('id, name')
          .eq('team_id', teamId)
          .eq('role', 'player');
          
        if (error) throw error;
        
        if (teamMembers && teamMembers.length > 0) {
          for (const member of teamMembers) {
            try {
              await refreshPlayerStats(member.id);
              results[member.id] = 'Success';
            } catch (playerError) {
              results[member.id] = 'Failed';
            }
          }
        }
      } else {
        // Refresh all player stats
        const result = await refreshPlayerStats('all');
        Object.assign(results, result);
      }
      
      setProcessingResults(results);
      toast.success("Stats refresh complete");
      await refetchCounts();
      if (onProcessingComplete) onProcessingComplete();
    } catch (error) {
      toast.error("Failed to refresh stats");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              System Stats Debug
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <Alert variant="outline">
              <AlertDescription className="text-xs">
                Advanced debugging tools for the stats system. These actions will affect the entire system.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Total Raw Stats</div>
                <div className="font-semibold">{statsCounts?.rawCount || 0}</div>
              </div>
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Total Player Stats</div>
                <div className="font-semibold">{statsCounts?.playerCount || 0}</div>
              </div>
            </div>

            {playerId && (
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Player Raw Stats</div>
                <div className="font-semibold">{statsCounts?.playerRawCount || 0}</div>
              </div>
            )}

            {teamId && (
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-xs text-muted-foreground">Team Raw Stats</div>
                <div className="font-semibold">{statsCounts?.teamRawCount || 0}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="sm:flex-1"
              >
                {isRefreshing ? "Processing..." : "Refresh All Stats"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprocessAll}
                disabled={isReprocessing}
                className="sm:flex-1"
              >
                {isReprocessing ? "Reprocessing..." : "Reprocess All Stats"}
              </Button>
            </div>

            {Object.keys(processingResults).length > 0 && (
              <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                <pre>{JSON.stringify(processingResults, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
