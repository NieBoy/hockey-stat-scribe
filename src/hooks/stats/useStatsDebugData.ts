
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useStatsDebugData() {
  const [debugData, setDebugData] = useState<{
    rawGameStats: any[];
    playerStats: any[];
    gameCount: number;
    playerCount: number;
  }>({
    rawGameStats: [],
    playerStats: [],
    gameCount: 0,
    playerCount: 0
  });

  // Game stats query
  useQuery({
    queryKey: ['debugGameStats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('game_stats')
          .select('*');
          
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
  useQuery({
    queryKey: ['debugPlayerStats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*');
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, playerStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug player stats:", error);
        return [];
      }
    }
  });
  
  // Game count query
  useQuery({
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
  useQuery({
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

  return { debugData };
}
