
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
    
    if (isProcessing) {
      addStatusMessage("Processing already in progress");
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

  const processPlayer = async (playerId: string) => {
    try {
      addStatusMessage(`Fetching game events for player ${playerId}...`);
      
      // Fix: Use proper JSONB queries with explicit operator syntax
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('*')
        .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`);

      if (eventsError) {
        throw new Error(`Error fetching events: ${eventsError.message}`);
      }
      
      if (!events || events.length === 0) {
        addStatusMessage("No game events found for this player.");
        setFinishedProcessing(true);
        return;
      }

      setGameEvents(events);
      addStatusMessage(`Found ${events.length} events for processing`);

      // Log events for debugging
      events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
          id: event.id,
          type: event.event_type,
          details: event.details
        });
      });

      addStatusMessage("Refreshing player stats...");
      
      // Call refresh_player_stats RPC with correct parameter syntax
      const { error: refreshError } = await supabase.rpc('refresh_player_stats', {
        player_id: playerId
      });
      
      if (refreshError) {
        throw new Error(`Error refreshing stats: ${refreshError.message}`);
      }
      
      addStatusMessage("Stats processing complete");
      setFinishedProcessing(true);
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
      toast.success("Player stats processing completed");
    } catch (error: any) {
      throw error;
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

  return {
    isProcessing,
    statusMessages,
    error,
    gameEvents,
    finishedProcessing,
    processPlayerStats
  };
};
