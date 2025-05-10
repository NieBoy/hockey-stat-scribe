
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams } from "@/services/teams";
import { User, Team } from "@/types";
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
    if (teams && (teams as Team[]).length > 0) {
      const playersFromTeams: User[] = [];
      (teams as Team[]).forEach(team => {
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
    if (!user) return [];
    
    console.log("Filtering teams for user:", user.id, user.name, user.role);
    console.log("Available teams:", (teams as Team[]).map(t => ({ id: t.id, name: t.name })));
    
    const isAdmin = user.role.includes('admin');
    const isCoach = user.role.includes('coach');
    const isPlayer = user.role.includes('player');
    const isParent = user.role.includes('parent');

    // Admin can see all teams - return them immediately
    if (isAdmin) {
      console.log("User is admin, returning all teams:", (teams as Team[]).length);
      return teams as Team[];
    }
    
    // For other roles, filter teams based on membership
    return (teams as Team[]).filter(team => {
      console.log("Checking team:", team.name);
      
      // Coach can see teams they coach
      if (isCoach) {
        const isCoaching = team.coaches?.some(coach => coach.id === user.id);
        console.log("Is coaching this team:", isCoaching);
        if (isCoaching) return true;
      }
      
      // Player can see teams they play in
      if (isPlayer) {
        const isPlaying = team.players?.some(player => player.id === user.id);
        console.log("Is playing in this team:", isPlaying);
        if (isPlaying) return true;
      }
      
      // Parent can see teams their children play in
      if (isParent && team.parents) {
        const isParentInTeam = team.parents.some(parent => parent.id === user.id);
        console.log("Is parent in this team:", isParentInTeam);
        if (isParentInTeam) return true;
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
