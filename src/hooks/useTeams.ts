
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams, addPlayerToTeam } from "@/services/teams";
import { toast } from "sonner";
import { Team } from "@/types";

export function useTeams() {
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: "",
    number: ""
  });

  const { 
    data: teams, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const selectedTeam = selectedTeamId && teams
    ? teams.find(team => team.id === selectedTeamId)
    : null;

  const handleAddPlayer = (teamId: string) => {
    setSelectedTeamId(teamId);
    setAddPlayerDialogOpen(true);
  };

  const submitNewPlayer = async () => {
    if (!selectedTeam) return;
    
    if (newPlayer.name) {
      try {
        console.log(`Adding player to team ${selectedTeam.id}:`, newPlayer);
        
        await addPlayerToTeam(selectedTeam.id, {
          name: newPlayer.name,
          email: newPlayer.email || undefined, // Optional email
          position: newPlayer.position || undefined, // Optional position
          number: newPlayer.number
        });
        
        toast.success(`Player ${newPlayer.name} added to ${selectedTeam.name}!`);
        setAddPlayerDialogOpen(false);
        setNewPlayer({ name: "", email: "", position: "", number: "" });
        
        // Force a refetch to get the updated team data including the new player
        console.log("Refetching teams data after adding player...");
        refetch(); 
      } catch (error) {
        console.error("Error adding player:", error);
        toast.error("Failed to add player");
      }
    } else {
      toast.error("Player name is required");
    }
  };

  return {
    teams,
    isLoading,
    error,
    refetch,
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeamId,
    selectedTeam,
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer
  };
}
