import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";
import { refreshPlayerStats } from "@/services/stats/playerStatsService";
import { toast } from "sonner";

interface StatsTabContentProps {
  team: Team;
}

const StatsTabContent = ({ team }: StatsTabContentProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['teamStats', team.id],
    queryFn: async () => {
      try {
        const playerIds = team.players.map(player => player.id);
        
        if (playerIds.length === 0) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .in('player_id', playerIds);
        
        if (error) throw error;
        
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

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      for (const player of team.players) {
        await refreshPlayerStats(player.id);
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading team stats: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Team Statistics</h2>
        <Button 
          onClick={refreshStats} 
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.length > 0 ? (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsTabContent;
