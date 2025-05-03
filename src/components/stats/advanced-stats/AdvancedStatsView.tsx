
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGameStats } from "@/services/stats/gameStatsService";
import { Game } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";
import FilterControls from "./FilterControls";
import StatsTable from "./StatsTable";
import DebugPanel from "./DebugPanel";
import { useStatsFiltering } from "./useStatsFiltering";

interface AdvancedStatsViewProps {
  game: Game;
}

export default function AdvancedStatsView({ game }: AdvancedStatsViewProps) {
  const [showDebug, setShowDebug] = useState(false);
  
  // Fetch game stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gameStats', game.id],
    queryFn: () => fetchGameStats(game.id),
  });

  // Fetch debug information
  const { debugData, refetchAll } = useStatsDebugData();

  // Use the filtering hook to get filtered and aggregated stats
  const {
    search,
    setSearch,
    statTypeFilter,
    setStatTypeFilter,
    teamFilter,
    setTeamFilter,
    periodFilter,
    setPeriodFilter,
    filteredStats,
    aggregatedStats
  } = useStatsFiltering(stats, game);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Stats View</CardTitle>
          <DebugPanel 
            showDebug={showDebug}
            setShowDebug={setShowDebug}
            debugData={debugData}
            filteredStats={filteredStats}
            refetchAll={refetchAll}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterControls
              search={search}
              setSearch={setSearch}
              statTypeFilter={statTypeFilter}
              setStatTypeFilter={setStatTypeFilter}
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              periodFilter={periodFilter}
              setPeriodFilter={setPeriodFilter}
              game={game}
            />
            
            <StatsTable aggregatedStats={aggregatedStats} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
