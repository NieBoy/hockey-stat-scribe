
import React, { useState } from "react";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { useQuery } from "@tanstack/react-query";
import { useTeamStatsData } from "@/hooks/teams/useTeamStatsData";
import TeamStatsHeader from "./stats/TeamStatsHeader";
import TeamStatsDebug from "./stats/TeamStatsDebug";

interface StatsTabContentProps {
  team: Team;
}

const StatsTabContent = ({ team }: StatsTabContentProps) => {
  const [debugMode, setDebugMode] = useState(false);
  
  const {
    stats,
    isLoading,
    error,
    isRefreshing,
    isReprocessing,
    refreshStatus,
    refreshStats,
    handleReprocessAllStats,
    refetch
  } = useTeamStatsData(team);

  // Debug queries
  const { data: rawGameStats } = useQuery({
    queryKey: ['rawGameStats', team.id],
    queryFn: async () => {
      try {
        const playerIds = team.players.map(player => player.id);
        if (playerIds.length === 0) return [];
        
        const { data, error } = await supabase
          .from('game_stats')
          .select('*')
          .in('player_id', playerIds)
          .order('timestamp', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching raw game stats:", error);
        return [];
      }
    },
    enabled: debugMode && team.players.length > 0
  });

  // Debug query for game events
  const { data: gameEvents } = useQuery({
    queryKey: ['gameEvents', team.id],
    queryFn: async () => {
      try {
        const { data: games } = await supabase
          .from('games')
          .select('id')
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);
          
        if (!games || games.length === 0) return [];
        
        const gameIds = games.map(g => g.id);
        
        const { data, error } = await supabase
          .from('game_events')
          .select('*')
          .in('game_id', gameIds)
          .order('timestamp', { ascending: false })
          .limit(100);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching game events:", error);
        return [];
      }
    },
    enabled: debugMode && team.players.length > 0
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <h3 className="font-semibold mb-1">Error loading team stats</h3>
        <p>{error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const hasStatsData = stats && stats.length > 0;

  return (
    <div className="space-y-6">
      <TeamStatsHeader 
        onRefresh={refreshStats}
        isRefreshing={isRefreshing}
        onToggleDebug={() => setDebugMode(!debugMode)}
        debugMode={debugMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {hasStatsData ? (
            <SortableStatsTable 
              stats={stats} 
              getPlayerName={(playerId) => {
                const player = team.players.find(p => p.id === playerId);
                return player?.name || "Unknown Player";
              }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p>No statistics available for this team.</p>
              <p className="mt-2 text-sm">This could mean:</p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>No games have been played yet</li>
                <li>No stats have been recorded</li>
                <li>Stats need to be refreshed</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                <Button 
                  onClick={refreshStats} 
                  variant="outline" 
                  className="gap-2"
                  disabled={isRefreshing}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Stats
                </Button>
                <Button 
                  onClick={handleReprocessAllStats} 
                  variant="outline" 
                  className="gap-2"
                  disabled={isReprocessing}
                >
                  <History className="h-4 w-4" />
                  Reprocess All Stats
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {debugMode && (
        <TeamStatsDebug
          team={team}
          refreshStatus={refreshStatus}
          onReprocessAllStats={handleReprocessAllStats}
          isReprocessing={isReprocessing}
          rawGameStats={rawGameStats}
          gameEvents={gameEvents}
          stats={stats}
        />
      )}
    </div>
  );
};

export default StatsTabContent;
