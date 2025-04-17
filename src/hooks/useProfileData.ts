
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams } from "@/services/teams";
import { User } from "@/types";
import { toast } from "sonner";

export function useProfileData(user: User | null) {
  const [allPlayers, setAllPlayers] = useState<User[]>([]);

  // Query to fetch teams data
  const { 
    data: teams = [], 
    isLoading: teamsLoading, 
    error: teamsError, 
    refetch 
  } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    enabled: !!user,
    // Force refetch when the component mounts
    refetchOnMount: true,
    // Refresh teams data when this component is active, but less frequently
    refetchInterval: 5000,
    // Add retry logic for more resilience
    retry: 3,
    retryDelay: 1000
  });

  // Handle errors separately
  useEffect(() => {
    if (teamsError) {
      console.error("Failed to fetch teams:", teamsError);
      toast.error("Failed to load teams data");
    }
  }, [teamsError]);

  // Extract all players from teams
  useEffect(() => {
    console.log("Teams loaded:", teams);
    
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
    }

    // Extract all players from all teams
    if (teams && teams.length > 0) {
      const playersFromTeams: User[] = [];
      teams.forEach(team => {
        console.log(`Processing team ${team.name} with ${team.players?.length || 0} players`);
        if (team.players && team.players.length > 0) {
          team.players.forEach(player => {
            // Add team information to player
            const playerWithTeam = {
              ...player,
              teams: player.teams || [{ 
                id: team.id, 
                name: team.name,
                players: [],
                coaches: [],
                parents: []
              }]
            };
            playersFromTeams.push(playerWithTeam);
          });
        }
      });
      setAllPlayers(playersFromTeams);
      console.log("All players extracted:", playersFromTeams);
    } else {
      console.log("No teams available or teams is empty");
      setAllPlayers([]);
    }
  }, [teams, teamsError]);

  // Get teams for the current user
  const filterUserTeams = (user: User) => {
    const isAdmin = user.role.includes('admin');
    const isCoach = user.role.includes('coach');
    const isPlayer = user.role.includes('player');
    const isParent = user.role.includes('parent');

    return teams.filter(team => {
      console.log("Filtering team:", team.id, team.name);
      console.log("Team coaches:", team.coaches?.map(c => c.id));
      
      // Admin can see all teams
      if (isAdmin) return true;
      
      // Coach can see teams they coach
      if (isCoach) {
        const isCoaching = team.coaches?.some(coach => coach.id === user.id);
        console.log("Is coaching this team:", isCoaching, "user.id:", user.id);
        return isCoaching;
      }
      
      // Player can see teams they play in
      if (isPlayer) {
        const isPlaying = team.players?.some(player => player.id === user.id);
        console.log("Is player in this team:", isPlaying);
        return isPlaying;
      }
      
      // Parent can see teams their children play in
      if (isParent) {
        const isParentInTeam = team.parents?.some(parent => parent.id === user.id);
        console.log("Is parent in this team:", isParentInTeam);
        return isParentInTeam;
      }
      
      return false;
    });
  };

  return { 
    teams, 
    allPlayers, 
    teamsLoading, 
    teamsError, 
    refetch,
    filterUserTeams
  };
}
