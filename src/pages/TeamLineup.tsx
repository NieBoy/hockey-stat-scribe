
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTeamById } from "@/services/teams";
import { useTeams } from "@/hooks/useTeams";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Lines } from "@/types";
import { updateTeamLineup } from "@/services/teams/lineup";
import { toast } from "sonner";
import { cloneDeep } from "lodash";
import { ImprovedLineupEditor } from "@/components/teams/lineup/ImprovedLineupEditor";

export default function TeamLineup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeam,
    newPlayer,
    setNewPlayer,
    submitNewPlayer
  } = useTeams(id);
  
  // Update staleTime to 0 to always fetch fresh data
  const { data: team, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
    // Always get fresh data
    staleTime: 0, 
    // Disable automatic refetch interval to prevent auto-refreshes
    refetchInterval: false,
  });

  // Force refetch only when component mounts
  useEffect(() => {
    if (id) {
      console.log("TeamLineup - Component mounted, force refetching team data");
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      refetch();
    }
  }, [id, queryClient, refetch]);
  
  const handleSaveLineup = async (lines: Lines) => {
    if (!team?.id) {
      console.error("Unable to save lineup: team ID not available");
      toast.error("Unable to save lineup: team ID not available");
      return false;
    }
    
    try {
      console.log("TeamLineup - Manually saving lineup for team:", team.id);
      console.log("TeamLineup - Lines structure received:", JSON.stringify(lines, null, 2));
      
      // Create a deep copy of the lines to prevent any mutation issues
      const linesToSave = cloneDeep(lines);
      
      // Validate the structure before saving
      if (!linesToSave.forwards || !linesToSave.defense || !linesToSave.goalies) {
        console.error("Invalid lineup structure", linesToSave);
        toast.error("Invalid lineup structure");
        return false;
      }
      
      // Check if we have any valid data to save
      const hasPlayers = (
        linesToSave.forwards.some(line => line.leftWing || line.center || line.rightWing) ||
        linesToSave.defense.some(line => line.leftDefense || line.rightDefense) ||
        linesToSave.goalies.length > 0
      );
      
      if (!hasPlayers) {
        console.log("No players in lineup to save");
        toast.info("No players in lineup to save");
        return true; // Not an error, just nothing to save
      }
      
      console.log("Saving lineup:", JSON.stringify(linesToSave, null, 2));
      
      const success = await updateTeamLineup(team.id, linesToSave);
      
      if (success) {
        console.log("TeamLineup - Lineup saved successfully");
        
        // Invalidate all team data to ensure it gets refreshed everywhere
        queryClient.invalidateQueries({ queryKey: ['team'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        
        // Specific invalidation for this team
        queryClient.invalidateQueries({ queryKey: ['team', team.id] });
        
        return true;
      } else {
        console.error("TeamLineup - Failed to update lineup");
        throw new Error("Failed to update lineup");
      }
    } catch (error) {
      console.error("TeamLineup - Error saving lineup:", error);
      toast.error("Error saving lineup", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }
  
  if (error || !team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist or there was an error loading it.</p>
          <p className="text-sm text-red-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2" 
            onClick={() => navigate(`/teams/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Team
          </Button>
        </div>
        
        <ImprovedLineupEditor team={team} onSaveLineup={handleSaveLineup} />

        <AddPlayerDialog
          isOpen={addPlayerDialogOpen}
          onOpenChange={setAddPlayerDialogOpen}
          selectedTeam={selectedTeam}
          onSubmit={submitNewPlayer}
          newPlayer={newPlayer}
          setNewPlayer={setNewPlayer}
        />
      </div>
    </MainLayout>
  );
}
