
import StatsSystemDebug from "@/components/stats/debug/StatsSystemDebug";
import StatsProcessingStatus from "@/components/stats/debug/StatsProcessingStatus";
import StatsDebugPanel from "@/components/stats/debug/StatsDebugPanel";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";
import { useState } from "react";

interface PlayerStatsDebugProps {
  playerId: string;
  stats: any[];
  onRefresh: () => void;
}

export default function PlayerStatsDebug({ playerId, stats, onRefresh }: PlayerStatsDebugProps) {
  const { debugData, refetchAll: refetchDebugData } = useStatsDebugData(playerId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  const handleProcessingComplete = () => {
    console.log("Stats processing complete, refreshing data");
    onRefresh();
    refetchDebugData();
  };

  const addStatusMessage = (message: string) => {
    setStatusMessages(prev => [...prev, message]);
  };

  return (
    <div className="space-y-6 mt-8">
      <StatsProcessingStatus 
        playerId={playerId} 
        onRefresh={onRefresh}
        statusMessages={statusMessages} 
        error={null}
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
