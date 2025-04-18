
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTeamById } from "@/services/teams";
import { useTeams } from "@/hooks/useTeams";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SimpleLineupEditor } from "@/components/teams/lineup/SimpleLineupEditor";
import { Lines } from "@/types";
import { updateTeamLineup } from "@/services/teams/lineup";
import { toast } from "sonner";

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
    handleAddPlayer,
    submitNewPlayer
  } = useTeams(id);
  
  // Update staleTime to 0 to always fetch fresh data
  const { data: team, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
    // Always get fresh data
    staleTime: 0, 
    // Refetch every 30 seconds
    refetchInterval: 30000,
  });

  // Force refetch when component mounts
  useEffect(() => {
    if (id) {
      console.log("TeamLineup - Component mounted, force refetching team data");
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      refetch();
    }
  }, [id, queryClient, refetch]);
  
  const handleSaveLineup = useCallback(async (lines: Lines) => {
    if (!team?.id) {
      toast.error("Unable to save lineup: team ID not available");
      return false;
    }
    
    try {
      console.log("TeamLineup - Saving lineup for team:", team.id);
      console.log("TeamLineup - Lineup data being saved:", JSON.stringify(lines, null, 2));
      
      const success = await updateTeamLineup(team.id, lines);
      
      if (success) {
        console.log("TeamLineup - Lineup saved successfully");
        toast.success("Lineup saved successfully");
        
        // Invalidate all team data to ensure it gets refreshed everywhere
        queryClient.invalidateQueries({ queryKey: ['team'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        
        // Specific invalidation for this team
        queryClient.invalidateQueries({ queryKey: ['team', team.id] });
        
        // Force refetch to make sure we have the latest data
        refetch();
        
        return true;
      } else {
        console.error("TeamLineup - Failed to update lineup");
        throw new Error("Failed to update lineup");
      }
    } catch (error) {
      console.error("TeamLineup - Error saving lineup:", error);
      toast.error("Failed to save lineup", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }, [team?.id, queryClient, refetch]);
  
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
        
        <SimpleLineupEditor team={team} onSaveLineup={handleSaveLineup} />

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
