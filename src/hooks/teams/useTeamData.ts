
import { useQuery } from "@tanstack/react-query";
import { getTeams, getTeamById } from "@/services/teams";
import { Team } from "@/types";

export function useTeamData(teamId?: string) {
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const teamQuery = teamId ? useQuery({
    queryKey: ['team', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 10000,
  }) : { data: null, isLoading: false, error: null };

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
