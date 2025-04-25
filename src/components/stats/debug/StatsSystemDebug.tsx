
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { refreshPlayerStats } from "@/services/stats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle2,
  XCircle
} from "lucide-react";

interface StatsSystemDebugProps {
  playerId?: string;
  teamId?: string;
  onProcessingComplete?: () => void;
}

const StatsSystemDebug = ({ playerId, teamId, onProcessingComplete }: StatsSystemDebugProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameEvents, setGameEvents] = useState<any[]>([]);
  const [finishedProcessing, setFinishedProcessing] = useState(false);

  const addStatusMessage = (message: string) => {
    setStatusMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const processPlayerStats = async () => {
    if (!playerId && !teamId) {
      setError("Either player ID or team ID must be provided");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setStatusMessages([]);
    setFinishedProcessing(false);

    try {
      // Handle team-based processing
      if (teamId) {
        addStatusMessage(`Processing stats for team ID: ${teamId}`);
        
        // Fetch team members first
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('id, name')
          .eq('team_id', teamId);
          
        if (membersError) throw new Error(`Error fetching team members: ${membersError.message}`);
        
        if (!members || members.length === 0) {
          addStatusMessage("No team members found for this team.");
          setIsProcessing(false);
          return;
        }
        
        addStatusMessage(`Found ${members.length} team members to process`);
        
        // Process each player in the team
        for (const member of members) {
          addStatusMessage(`Processing player: ${member.name} (${member.id})`);
          await processPlayerInternal(member.id);
        }
        
        addStatusMessage("Team stats processing complete");
        setFinishedProcessing(true);
        
        if (onProcessingComplete) {
          onProcessingComplete();
        }
        
        toast.success("Team stats processing completed");
        
      } else if (playerId) {
        await processPlayerInternal(playerId);
        
        if (onProcessingComplete) {
          onProcessingComplete();
        }
        
        toast.success("Player stats processing completed");
      }
    } catch (error: any) {
      console.error("Error in stats processing:", error);
      setError(error.message);
      addStatusMessage(`Error: ${error.message}`);
      toast.error("Failed to process stats");
    } finally {
      setIsProcessing(false);
    }
  };

  const processPlayerInternal = async (playerId: string) => {
    try {
      // Step 1: Get events for this player using correct JSONB query syntax
      addStatusMessage(`Fetching game events for player ${playerId}...`);
      
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('*')
        .or(
          `details->playerId.eq."${playerId}",` +
          `details->primaryAssistId.eq."${playerId}",` +
          `details->secondaryAssistId.eq."${playerId}"`
        )
        .order('timestamp', { ascending: true });

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        throw new Error(`Error fetching events: ${eventsError.message}`);
      }
      
      if (!events || events.length === 0) {
        addStatusMessage("No game events found for this player.");
        return;
      }

      setGameEvents(events);
      addStatusMessage(`Found ${events.length} events for processing`);

      // Log event details for debugging
      events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event.id,
          type: event.event_type,
          details: event.details
        });
      });

      // Step 2: Process events for player
      addStatusMessage("Processing events to stats...");
      const { data: gameEventsResult, error: processError } = await supabase.rpc(
        'refresh_player_stats',
        { p_player_id: playerId }
      );
      
      if (processError) {
        console.error("Error processing events:", processError);
        throw new Error(`Error processing events: ${processError.message}`);
      }
      
      addStatusMessage(`Stats processing completed: ${JSON.stringify(gameEventsResult)}`);
      
      // Step 3: Verify the stats were created
      const { data: gameStats, error: statsError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (statsError) {
        addStatusMessage(`Error verifying game stats: ${statsError.message}`);
      } else {
        addStatusMessage(`Found ${gameStats?.length || 0} game stats for verification`);
        
        // Step 4: Get player stats
        const { data: playerStats, error: playerStatsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerId);
        
        if (playerStatsError) {
          addStatusMessage(`Error fetching player stats: ${playerStatsError.message}`);
        } else {
          addStatusMessage(`Found ${playerStats?.length || 0} aggregated player stats`);
        }
      }

      // Step 5: Final refresh
      addStatusMessage("Final stats refresh...");
      const refreshResult = await refreshPlayerStats(playerId);
      
      if (refreshResult?.success) {
        addStatusMessage("Stats processing complete");
        setFinishedProcessing(true);
      } else {
        addStatusMessage(`Stats refresh reported an issue: ${JSON.stringify(refreshResult)}`);
      }
    } catch (error: any) {
      console.error("Error in processPlayerInternal:", error);
      throw error;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4" />
          Stats System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={processPlayerStats}
          disabled={isProcessing}
          size="sm"
          className="w-full gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
          {isProcessing ? "Processing Stats..." : "Process All Stats"}
        </Button>

        {statusMessages.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Processing Log
              </span>
              
              {finishedProcessing ? (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </span>
              ) : isProcessing ? (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  In Progress
                </span>
              ) : statusMessages.length > 0 && error ? (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Failed
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                </span>
              )}
            </div>
            
            <div className="bg-muted p-2 rounded text-xs overflow-auto max-h-40 font-mono">
              {statusMessages.map((msg, i) => (
                <div key={i} className="pb-0.5">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameEvents.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Game Events Being Processed ({gameEvents.length})</p>
            <div className="bg-muted p-2 rounded text-xs overflow-auto max-h-20">
              <pre>{JSON.stringify(gameEvents, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsSystemDebug;
