
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getPlayerStats } from "@/services/stats";
import { fetchGameStats } from "@/services/stats/gameStatsService";

export function usePlayerStatsData(playerId: string) {
  // Stats query
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['playerStats', playerId],
    queryFn: () => getPlayerStats(playerId),
    enabled: !!playerId
  });

  // Raw game stats query
  const { data: rawGameStats, refetch: refetchRawStats } = useQuery({
    queryKey: ['rawGameStats', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      try {
        return await fetchGameStats('', playerId);
      } catch (error) {
        console.error("Error fetching raw game stats:", error);
        return [];
      }
    },
    enabled: !!playerId
  });

  // Game events query
  const { data: playerGameEvents } = useQuery({
    queryKey: ['playerGameEvents', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('game_events')
          .select(`
            id, 
            game_id, 
            event_type, 
            period, 
            team_type, 
            timestamp,
            details
          `)
          .contains('details', { playerId })
          .order('timestamp', { ascending: false });
          
        if (eventError) throw eventError;
        return eventData || [];
      } catch (error) {
        console.error("Error in fetchPlayerGameEvents:", error);
        return [];
      }
    },
    enabled: !!playerId
  });

  // Player's team query
  const { data: playerTeam } = useQuery({
    queryKey: ['playerTeam', playerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('id', playerId)
          .single();
          
        if (error) throw error;
        
        if (data?.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', data.team_id)
            .single();
            
          if (teamError) throw teamError;
          return teamData;
        }
        return null;
      } catch (error) {
        console.error("Error fetching player team:", error);
        return null;
      }
    },
    enabled: !!playerId
  });

  // Team games query
  const { data: teamGames } = useQuery({
    queryKey: ['teamGames', playerTeam?.id],
    queryFn: async () => {
      if (!playerTeam?.id) return [];
      try {
        const { data, error } = await supabase
          .from('games')
          .select('id, date, home_team_id, away_team_id, location')
          .or(`home_team_id.eq.${playerTeam.id},away_team_id.eq.${playerTeam.id}`);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching team games:", error);
        return [];
      }
    },
    enabled: !!playerTeam?.id
  });

  return {
    stats,
    statsLoading,
    statsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats
  };
}
