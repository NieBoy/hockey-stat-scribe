
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeamById } from "@/services/teams";
import { Team } from "@/types";
import { useLineupRefreshKey } from "./teams/useLineupRefreshKey";
import { useTeamInvitations } from "./teams/useTeamInvitations";
import { useTeamRefresh } from "./teams/useTeamRefresh";
import { addPlayerToTeam, removePlayerFromTeam } from "@/services/teams";

export function useTeamData(teamId: string) {
  // Track the currently active tab in the UI
  const [activeTab, setActiveTab] = useState("players");
  
  // Track the player dialog state
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: "",
    number: "",
  });
  
  // Fetch team data using React Query
  const {
    data: team,
    isLoading: isLoadingTeam,
    error: teamError,
    refetch: refetchTeam
  } = useQuery<Team | null>({
    queryKey: ['team', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 10000,
  });
  
  // Initialize lineup refresh functionality
  const {
    lineupRefreshKey,
    setLineupRefreshKey,
    handleTeamUpdate,
    handleRefreshLineup,
  } = useLineupRefreshKey(refetchTeam);
  
  // Initialize team invitation functionality
  const {
    isSendingInvitations,
    lastInvitationSent,
    handleSendInvitations,
    handleRemoveMember,
  } = useTeamInvitations(teamId, refetchTeam);
  
  // Set up auto-refresh of team data
  useTeamRefresh(refetchTeam, setLineupRefreshKey);
  
  // Handler for adding a new player
  const handleAddPlayer = () => {
    setAddPlayerDialogOpen(true);
    setNewPlayer({
      name: "",
      email: "",
      position: "",
      number: "",
    });
  };
  
  // Submit function for the new player form
  const submitNewPlayer = async () => {
    if (!newPlayer.name.trim()) return;
    
    try {
      await addPlayerToTeam(teamId, {
        name: newPlayer.name,
        email: newPlayer.email || undefined,
        position: newPlayer.position || undefined,
        number: newPlayer.number || "0"
      });
      
      setAddPlayerDialogOpen(false);
      refetchTeam();
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };
  
  // Handler for removing a player
  const handleRemovePlayer = async (teamId: string, playerId: string) => {
    try {
      await removePlayerFromTeam(teamId, playerId);
      refetchTeam();
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };
  
  return {
    // Team data
    team,
    isLoadingTeam,
    teamError,
    refetchTeam,
    
    // UI state
    activeTab,
    setActiveTab,
    lineupRefreshKey,
    
    // Player dialog state
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    newPlayer,
    setNewPlayer,
    
    // Team functions
    handleAddPlayer,
    submitNewPlayer,
    handleRemovePlayer,
    handleTeamUpdate,
    handleRefreshLineup,
    
    // Invitation functions
    handleSendInvitations,
    handleRemoveMember,
    isSendingInvitations,
    lastInvitationSent,
    
    // Computed properties
    selectedTeam: team
  };
}
