
import { useQuery } from "@tanstack/react-query";
import { getTeams, getTeamById } from "@/services/teams";
import { Team } from "@/types";

export function useTeamData(teamId?: string) {
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0, // Always consider teams data stale to force refresh
  });

  const teamQuery = teamId 
    ? useQuery<Team | null>({
        queryKey: ['team', teamId],
        queryFn: () => getTeamById(teamId),
        enabled: !!teamId,
        staleTime: 0, // Always consider team data stale
        refetchOnWindowFocus: true,
        refetchOnMount: true,
      })
    : {
        data: null,
        isLoading: false,
        error: null,
        refetch: async () => ({ data: null, isLoading: false, error: null })
      };

  return {
    teams: teamsQuery.data,
    isLoadingTeams: teamsQuery.isLoading,
    teamsError: teamsQuery.error,
    refetchTeams: teamsQuery.refetch,
    
    team: teamQuery.data as Team | null,
    isLoadingTeam: teamQuery.isLoading,
    teamError: teamQuery.error,
    refetchTeam: teamQuery.refetch
  };
}
