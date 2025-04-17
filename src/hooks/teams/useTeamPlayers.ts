
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { addPlayerToTeam, removePlayerFromTeam } from "@/services/teams";

export function useTeamPlayers(refetchTeams: () => Promise<any>) {
  // Check if user is authenticated
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  };

  const handleAddPlayer = async (teamId: string, playerData: {
    name: string;
    email: string;
    position: string;
    number: string;
  }) => {
    try {
      // Check authentication before proceeding
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("You must be logged in to add players");
        return false;
      }

      if (!playerData.name) {
        toast.error("Player name is required");
        return false;
      }
      
      console.log(`Adding player to team ${teamId}:`, playerData);
      
      await addPlayerToTeam(teamId, {
        name: playerData.name,
        email: playerData.email || undefined,
        position: playerData.position || undefined,
        number: playerData.number
      });
      
      toast.success(`Player ${playerData.name} added to team!`);
      
      // Force a refetch to get the updated team data including the new player
      console.log("Refetching teams data after adding player...");
      await refetchTeams();
      return true;
    } catch (error) {
      console.error("Error adding player:", error);
      let errorMessage = "Unknown error occurred while adding player";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error_description) {
          errorMessage = supabaseError.error_description;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        }
      }
      
      toast.error(`Failed to add player: ${errorMessage}`);
      return false;
    }
  };

  const handleRemovePlayer = async (teamId: string, playerId: string, playerName: string) => {
    try {
      // Check authentication before proceeding
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast.error("You must be logged in to remove players");
        return false;
      }

      console.log(`Removing player ${playerId} from team ${teamId}`);
      
      await removePlayerFromTeam(teamId, playerId);
      
      toast.success(`Player ${playerName} removed from team!`);
      
      // Force a refetch to update the teams data
      console.log("Refetching teams data after removing player...");
      await refetchTeams();
      return true;
    } catch (error) {
      console.error("Error removing player:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while removing player';
      
      toast.error(`Failed to remove player: ${errorMessage}`);
      return false;
    }
  };

  return {
    handleAddPlayer,
    handleRemovePlayer
  };
}
