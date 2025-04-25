
import StatsSystemDebug from "@/components/stats/debug/StatsSystemDebug";
import StatsProcessingStatus from "@/components/stats/debug/StatsProcessingStatus";
import StatsDebugPanel from "@/components/stats/debug/StatsDebugPanel";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PlayerStatsDebugProps {
  playerId: string;
  stats: any[];
  onRefresh: () => void;
}

export default function PlayerStatsDebug({ playerId, stats, onRefresh }: PlayerStatsDebugProps) {
  const { debugData, refetchAll: refetchDebugData, errors } = useStatsDebugData(playerId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [processingErrors, setProcessingErrors] = useState<string | null>(null);

  const handleProcessingComplete = async () => {
    console.log("Stats processing complete, refreshing data");
    try {
      await onRefresh();
      await refetchDebugData();
      toast.success("Stats processing and refresh completed");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error during refresh";
      console.error("Error during refresh:", error);
      toast.error("Error refreshing stats after processing");
      setProcessingErrors(errorMessage);
    }
  };

  const addStatusMessage = (message: string) => {
    console.log("Debug status:", message);
    setStatusMessages(prev => [...prev, message]);
  };

  // Handle SQL errors from the debug data
  const sqlErrors = errors?.playerStatsError || errors?.rawGameStatsError;
  
  return (
    <div className="space-y-6 mt-8 border-t pt-6">
      {sqlErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Database Error:</strong> {sqlErrors.message}
          </AlertDescription>
        </Alert>
      )}
      
      {processingErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Processing Error:</strong> {processingErrors}
          </AlertDescription>
        </Alert>
      )}
      
      <StatsProcessingStatus 
        playerId={playerId} 
        onRefresh={onRefresh}
        statusMessages={statusMessages} 
        error={processingErrors}
        isProcessing={isProcessing}
        finishedProcessing={false}
      />
      
      <StatsSystemDebug
        playerId={playerId}
        onProcessingComplete={handleProcessingComplete}
        onStatusUpdate={addStatusMessage}
        setIsProcessing={setIsProcessing}
      />
      
      <StatsDebugPanel 
        debugData={debugData} 
        stats={stats}
        playerId={playerId}
        onRefresh={refetchDebugData}
      />
    </div>
  );
}
