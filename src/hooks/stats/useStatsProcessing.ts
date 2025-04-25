
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "@/services/stats";
import { toast } from "sonner";

interface UseStatsProcessingProps {
  playerId?: string;
  teamId?: string;
  onProcessingComplete?: () => void;
}

export const useStatsProcessing = ({ playerId, teamId, onProcessingComplete }: UseStatsProcessingProps) => {
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
      if (teamId) {
        await processTeam();
      } else if (playerId) {
        await processPlayer(playerId);
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

  const processTeam = async () => {
    addStatusMessage(`Processing stats for team ID: ${teamId}`);
    
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id, name')
      .eq('team_id', teamId);
      
    if (membersError) throw new Error(`Error fetching team members: ${membersError.message}`);
    
    if (!members || members.length === 0) {
      addStatusMessage("No team members found for this team.");
      return;
    }
    
    addStatusMessage(`Found ${members.length} team members to process`);
    
    for (const member of members) {
      addStatusMessage(`Processing player: ${member.name} (${member.id})`);
      await processPlayer(member.id);
    }
    
    addStatusMessage("Team stats processing complete");
    setFinishedProcessing(true);
    
    if (onProcessingComplete) {
      onProcessingComplete();
    }
    
    toast.success("Team stats processing completed");
  };

  const processPlayer = async (playerId: string) => {
    try {
      addStatusMessage(`Fetching game events for player ${playerId}...`);
      
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('*')
        .or(
          `details->>'playerId'.eq.${playerId},` + 
          `details->>'primaryAssistId'.eq.${playerId},` +
          `details->>'secondaryAssistId'.eq.${playerId},` +
          `details->'playersOnIce'??${playerId}`
        )
        .order('timestamp', { ascending: true });

      if (eventsError) {
        throw new Error(`Error fetching events: ${eventsError.message}`);
      }
      
      if (!events || events.length === 0) {
        addStatusMessage("No game events found for this player.");
        return;
      }

      setGameEvents(events);
      addStatusMessage(`Found ${events.length} events for processing`);

      events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event.id,
          type: event.event_type,
          details: event.details,
          playerId: event.details?.playerId,
          primaryAssistId: event.details?.primaryAssistId,
          secondaryAssistId: event.details?.secondaryAssistId,
          playersOnIce: event.details?.playersOnIce
        });
      });

      addStatusMessage("Processing events to game stats...");
      const { error: processError } = await supabase.rpc(
        'refresh_player_stats',
        { p_player_id: playerId }
      );
      
      if (processError) {
        throw new Error(`Error processing events: ${processError.message}`);
      }

      const { error: statsError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (statsError) {
        addStatusMessage(`Error verifying game stats: ${statsError.message}`);
      }

      addStatusMessage("Performing final stats refresh...");
      const refreshResult = await refreshPlayerStats(playerId);
      
      if (refreshResult?.success) {
        addStatusMessage("Stats processing complete");
        setFinishedProcessing(true);
        
        if (onProcessingComplete) {
          onProcessingComplete();
        }
        
        toast.success("Player stats processing completed");
      } else {
        addStatusMessage(`Stats refresh reported an issue: ${JSON.stringify(refreshResult)}`);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    isProcessing,
    statusMessages,
    error,
    gameEvents,
    finishedProcessing,
    processPlayerStats
  };
};
