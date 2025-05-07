
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatsDebugPanel from "../debug/StatsDebugPanel";
import { GameStat } from "@/types";

interface DebugPanelProps {
  showDebug: boolean;
  setShowDebug: (value: boolean) => void;
  debugData: any;
  filteredStats: GameStat[];
  refetchAll: () => void;
}

export default function DebugPanel({
  showDebug,
  setShowDebug,
  debugData,
  filteredStats,
  refetchAll
}: DebugPanelProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Switch 
          id="show-debug"
          checked={showDebug}
          onCheckedChange={setShowDebug}
        />
        <Label htmlFor="show-debug">Show Debug Panel</Label>
      </div>
      
      {showDebug && (
        <StatsDebugPanel 
          debugData={debugData} 
          stats={filteredStats.map(stat => ({
            id: stat.id,
            playerId: stat.player_id || stat.playerId || "", 
            statType: stat.stat_type || stat.statType || "goals",
            value: stat.value,
            gamesPlayed: 1
          }))}
          onRefresh={refetchAll}
        />
      )}
    </>
  );
}
