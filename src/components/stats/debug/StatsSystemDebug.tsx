
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import { useStatsProcessing } from "@/hooks/stats/useStatsProcessing";
import { StatsProcessingStatus } from "./StatsProcessingStatus";
import { EventsList } from "./EventsList";

interface StatsSystemDebugProps {
  playerId?: string;
  teamId?: string;
  onProcessingComplete?: () => void;
  onStatusUpdate?: (message: string) => void;
  setIsProcessing?: (isProcessing: boolean) => void;
}

const StatsSystemDebug = ({ 
  playerId, 
  teamId, 
  onProcessingComplete,
  onStatusUpdate,
  setIsProcessing
}: StatsSystemDebugProps) => {
  const {
    isProcessing,
    statusMessages,
    error,
    gameEvents,
    finishedProcessing,
    processPlayerStats
  } = useStatsProcessing({ 
    playerId, 
    teamId, 
    onProcessingComplete
  });

  // Forward processing status to parent component
  React.useEffect(() => {
    if (setIsProcessing) {
      setIsProcessing(isProcessing);
    }
    
    // Forward status messages to parent if needed
    if (onStatusUpdate && statusMessages.length > 0) {
      const lastMessage = statusMessages[statusMessages.length - 1];
      onStatusUpdate(lastMessage);
    }
  }, [isProcessing, statusMessages, setIsProcessing, onStatusUpdate]);

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4" />
          Stats System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={processPlayerStats}
          disabled={isProcessing}
          size="sm"
          className="w-full gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
          {isProcessing ? "Processing Stats..." : "Process All Stats"}
        </Button>

        <StatsProcessingStatus
          statusMessages={statusMessages}
          error={error}
          isProcessing={isProcessing}
          finishedProcessing={finishedProcessing}
        />

        <EventsList events={gameEvents} />
      </CardContent>
    </Card>
  );
};

export default StatsSystemDebug;
