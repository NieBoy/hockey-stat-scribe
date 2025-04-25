
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

/**
 * Hook to provide debugging data for player stats
 */
export function useStatsDebugData(playerId?: string) {
  // Basic player info
  const {
    data: playerInfo,
    error: playerError,
    refetch: refetchPlayerInfo
  } = useQuery({
    queryKey: ['debugPlayerInfo', playerId],
    queryFn: async () => {
      if (!playerId) return null;

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            id, 
            name,
            team_id
          `)
          .eq('id', playerId)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching player debug info:", error);
        return null;
      }
    },
    enabled: !!playerId
  });

  // Debug player stats 
  const {
    data: playerStats,
    error: playerStatsError,
    refetch: refetchPlayerStats
  } = useQuery({
    queryKey: ['debugPlayerStats', playerId],
    queryFn: async () => {
      try {
        let query = supabase.from('player_stats').select('*');
        
        if (playerId) {
          query = query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data as PlayerStat[];
      } catch (error) {
        console.error("Error fetching debug player stats:", error);
        return [];
      }
    },
    enabled: true
  });

  // Debug plus/minus stats
  const {
    data: plusMinusStats,
    error: plusMinusError,
    refetch: refetchPlusMinus
  } = useQuery({
    queryKey: ['debugPlusMinus', playerId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('game_stats')
          .select(`
            id, 
            player_id,
            game_id,
            period,
            value,
            details
          `)
          .eq('stat_type', 'plusMinus');
        
        if (playerId) {
          query = query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching debug plus/minus stats:", error);
        return [];
      }
    },
    enabled: true
  });
  
  // Debug raw game stats for counting
  const {
    data: rawGameStats,
    error: rawGameStatsError,
    refetch: refetchRawGameStats
  } = useQuery({
    queryKey: ['debugRawGameStats', playerId],
    queryFn: async () => {
      try {
        let query = supabase.from('game_stats').select('*');
        
        if (playerId) {
          query = query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching debug raw game stats:", error);
        return [];
      }
    },
    enabled: true
  });

  // Calculate counts for summary data
  const gameCount = rawGameStats ? [...new Set(rawGameStats.map(stat => stat.game_id))].length : 0;
  const playerCount = rawGameStats ? [...new Set(rawGameStats.map(stat => stat.player_id))].length : 0;

  // Refetch all debug data
  const refetchAll = async () => {
    await Promise.all([
      refetchPlayerInfo(),
      refetchPlayerStats(),
      refetchPlusMinus(),
      refetchRawGameStats()
    ]);
  };

  return {
    debugData: {
      playerInfo,
      playerStats,
      plusMinusStats,
      rawGameStats,
      gameCount,
      playerCount
    },
    errors: {
      playerError,
      playerStatsError,
      plusMinusError,
      rawGameStatsError
    },
    refetchAll
  };
}
