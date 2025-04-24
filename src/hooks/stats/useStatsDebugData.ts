
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useStatsDebugData(playerId?: string) {
  const [debugData, setDebugData] = useState<{
    rawGameStats: any[];
    playerStats: any[];
    gameCount: number;
    playerCount: number;
    plusMinusStats: any[];
  }>({
    rawGameStats: [],
    playerStats: [],
    gameCount: 0,
    playerCount: 0,
    plusMinusStats: []
  });

  // Game stats query - optionally filtered by player ID
  const { isLoading: loadingRawStats, refetch: refetchRawStats } = useQuery({
    queryKey: ['debugGameStats', playerId],
    queryFn: async () => {
      try {
        const query = supabase.from('game_stats').select('*');
        
        if (playerId) {
          query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, rawGameStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug game stats:", error);
        return [];
      }
    }
  });
  
  // Player stats query
  const { isLoading: loadingPlayerStats, refetch: refetchPlayerStats } = useQuery({
    queryKey: ['debugPlayerStats', playerId],
    queryFn: async () => {
      try {
        const query = supabase.from('player_stats').select('*, team_members!player_stats_player_id_fkey (name, team_id)');
        
        if (playerId) {
          query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, playerStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug player stats:", error);
        return [];
      }
    }
  });
  
  // Plus/minus specific stats query
  const { isLoading: loadingPlusMinusStats, refetch: refetchPlusMinusStats } = useQuery({
    queryKey: ['debugPlusMinusStats', playerId],
    queryFn: async () => {
      try {
        const query = supabase
          .from('game_stats')
          .select('*, games!game_stats_game_id_fkey(id, home_team_id, away_team_id), team_members!game_stats_player_id_fkey(name, team_id)')
          .eq('stat_type', 'plusMinus');
        
        if (playerId) {
          query.eq('player_id', playerId);
        }
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, plusMinusStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug plus/minus stats:", error);
        return [];
      }
    }
  });
  
  // Game count query
  const { isLoading: loadingGameCount, refetch: refetchGameCount } = useQuery({
    queryKey: ['debugGameCount'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, gameCount: count || 0 }));
        return count;
      } catch (error) {
        console.error("Error counting games:", error);
        return 0;
      }
    }
  });
  
  // Player count query
  const { isLoading: loadingPlayerCount, refetch: refetchPlayerCount } = useQuery({
    queryKey: ['debugPlayerCount'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'player');
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, playerCount: count || 0 }));
        return count;
      } catch (error) {
        console.error("Error counting players:", error);
        return 0;
      }
    }
  });
  
  const isLoading = loadingRawStats || loadingPlayerStats || loadingGameCount || 
                   loadingPlayerCount || loadingPlusMinusStats;
  
  const refetchAll = async () => {
    await Promise.all([
      refetchRawStats(),
      refetchPlayerStats(), 
      refetchGameCount(), 
      refetchPlayerCount(),
      refetchPlusMinusStats()
    ]);
  };

  return { 
    debugData, 
    isLoading,
    refetchAll 
  };
}
