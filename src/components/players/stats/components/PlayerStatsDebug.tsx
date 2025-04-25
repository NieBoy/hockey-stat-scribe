
import StatsSystemDebug from "@/components/stats/debug/StatsSystemDebug";
import StatsProcessingStatus from "@/components/stats/debug/StatsProcessingStatus";
import StatsDebugPanel from "@/components/stats/debug/StatsDebugPanel";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";

interface PlayerStatsDebugProps {
  playerId: string;
  stats: any[];
  onRefresh: () => void;
}

export default function PlayerStatsDebug({ playerId, stats, onRefresh }: PlayerStatsDebugProps) {
  const { debugData, refetchAll: refetchDebugData } = useStatsDebugData(playerId);

  const handleProcessingComplete = () => {
    onRefresh();
    refetchDebugData();
  };

  return (
    <>
      <StatsProcessingStatus 
        playerId={playerId} 
        onRefresh={onRefresh}
        statusMessages={[]} 
        error={null}
        isProcessing={false}
        finishedProcessing={false}
      />
      
      <StatsSystemDebug
        playerId={playerId}
        onProcessingComplete={handleProcessingComplete}
      />
      
      <StatsDebugPanel 
        debugData={debugData} 
        stats={stats}
        playerId={playerId}
        onRefresh={refetchDebugData}
      />
    </>
  );
}
