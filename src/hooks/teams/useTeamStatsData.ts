
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlayerStat, Team } from "@/types";
import { supabase } from "@/lib/supabase";
import { refreshPlayerStats } from "@/services/stats/playerStatsService";
import { reprocessAllStats } from "@/services/stats/core/statsRefresh";
import { toast } from "sonner";

export function useTeamStatsData(team: Team) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
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
            statType: stat.stat_type,
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

  return {
    stats,
    isLoading,
    error,
    isRefreshing,
    isReprocessing,
    refreshStatus,
    refreshStats,
    handleReprocessAllStats,
    refetch
  };
}
