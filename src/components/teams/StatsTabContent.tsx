
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Bug, History } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";
import { refreshPlayerStats } from "@/services/stats/playerStatsService";
import { reprocessAllStats } from "@/services/stats/core/statsRefresh";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StatsTabContentProps {
  team: Team;
}

const StatsTabContent = ({ team }: StatsTabContentProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<Record<string, string>>({});
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['teamStats', team.id],
    queryFn: async () => {
      try {
        console.log(`Fetching team stats for team ${team.id} with ${team.players.length} players`);
        const playerIds = team.players.map(player => player.id);
        
        if (playerIds.length === 0) {
          console.log("No players in team, returning empty stats array");
          return [];
        }
        
        console.log("Player IDs:", playerIds);
        
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .in('player_id', playerIds);
        
        if (error) {
          console.error("Error fetching team stats:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} stats records`);
        
        return (data || []).map(stat => {
          const player = team.players.find(p => p.id === stat.player_id);
          
          return {
            playerId: stat.player_id,
            statType: stat.stat_type as StatType,
            value: stat.value,
            gamesPlayed: stat.games_played,
            playerName: player?.name || 'Unknown Player'
          };
        });
      } catch (error) {
        console.error("Error fetching team stats:", error);
        throw error;
      }
    },
    enabled: team.players.length > 0
  });

  // Debugging query to check raw game stats
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

  // Debugging query to check game events
  const { data: gameEvents } = useQuery({
    queryKey: ['gameEvents', team.id],
    queryFn: async () => {
      try {
        // First get games this team played in
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

  const refreshStats = async () => {
    setIsRefreshing(true);
    setRefreshStatus({});
    const newStatus: Record<string, string> = {};
    
    try {
      for (const player of team.players) {
        try {
          newStatus[player.id] = "Processing...";
          setRefreshStatus({...newStatus});
          
          await refreshPlayerStats(player.id);
          newStatus[player.id] = "Success";
          setRefreshStatus({...newStatus});
        } catch (error) {
          console.error(`Error refreshing stats for player ${player.name}:`, error);
          newStatus[player.id] = "Failed";
          setRefreshStatus({...newStatus});
        }
      }
      
      await refetch();
      toast.success("Team statistics have been refreshed");
    } catch (error) {
      toast.error("Failed to refresh team statistics");
      console.error("Error refreshing team stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReprocessAllStats = async () => {
    setIsReprocessing(true);
    try {
      const success = await reprocessAllStats();
      if (success) {
        toast.success("All statistics have been reprocessed from game events");
        await refetch();
      } else {
        toast.error("Failed to reprocess statistics");
      }
    } catch (error) {
      console.error("Error reprocessing stats:", error);
      toast.error("Error reprocessing statistics");
    } finally {
      setIsReprocessing(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Team Statistics</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setDebugMode(!debugMode)}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <Bug className="h-4 w-4" />
            {debugMode ? "Hide Debug" : "Debug Mode"}
          </Button>
          
          <Button 
            onClick={refreshStats} 
            disabled={isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleReprocessAllStats} 
                variant="outline" 
                size="sm"
                className="gap-2"
                disabled={isReprocessing}
              >
                <History className="h-4 w-4" />
                Reprocess All Stats
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Refresh Status by Player</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(refreshStatus).map(([playerId, status]) => {
                  const player = team.players.find(p => p.id === playerId);
                  const statusColor = 
                    status === "Success" ? "text-green-600" :
                    status === "Failed" ? "text-red-600" : "text-yellow-600";
                    
                  return (
                    <div key={playerId} className="text-sm">
                      <span>{player?.name || playerId}: </span>
                      <span className={statusColor}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="player-ids">
                <AccordionTrigger>Player IDs ({team.players.length})</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(team.players.map(p => ({ name: p.name, id: p.id })), null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="raw-game-stats">
                <AccordionTrigger>
                  Raw Game Stats ({rawGameStats?.length || 0})
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(rawGameStats?.slice(0, 20), null, 2)}
                    {rawGameStats && rawGameStats.length > 20 && 
                      `\n... and ${rawGameStats.length - 20} more items`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="game-events">
                <AccordionTrigger>
                  Game Events ({gameEvents?.length || 0})
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(gameEvents?.slice(0, 20), null, 2)}
                    {gameEvents && gameEvents.length > 20 && 
                      `\n... and ${gameEvents.length - 20} more items`}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="aggregated-stats">
                <AccordionTrigger>
                  Aggregated Stats ({stats?.length || 0})
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsTabContent;
