
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
  const { 
    data: rawGameStats, 
    refetch: refetchRawStats,
    isLoading: rawStatsLoading 
  } = useQuery({
    queryKey: ['rawGameStats', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      try {
        console.log("Fetching raw game stats for player:", playerId);
        const stats = await fetchGameStats('', playerId);
        console.log(`Found ${stats.length} raw game stats for player`);
        return stats;
      } catch (error) {
        console.error("Error fetching raw game stats:", error);
        return [];
      }
    },
    enabled: !!playerId
  });

  // Game events query with correct format for JSON field queries
  const { 
    data: playerGameEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents 
  } = useQuery({
    queryKey: ['playerGameEvents', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      try {
        console.log("Fetching game events for player:", playerId);
        
        // Properly format the query for JSONB text fields
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
          .or(`details->>'playerId'=.${playerId},details->>'primaryAssistId'=.${playerId},details->>'secondaryAssistId'=.${playerId},details->'playersOnIce'::jsonb?.'${playerId}'`);
          
        if (eventError) {
          console.error("Error fetching player game events:", eventError);
          throw eventError;
        }
        
        console.log(`Found ${eventData?.length || 0} game events for player`);
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

  const isLoading = statsLoading || rawStatsLoading || eventsLoading;

  return {
    stats,
    statsLoading: isLoading,
    statsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats,
    refetchEvents
  };
}
