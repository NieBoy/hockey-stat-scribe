
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TeamLineupEditor from "@/components/teams/TeamLineupEditor";
import { Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTeamById, updateTeamLineup } from "@/services/teams";
import { useTeams } from "@/hooks/useTeams";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import RosterDragDrop from "@/components/teams/RosterDragDrop";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function TeamLineup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'standard' | 'drag-drop'>('standard');
  
  const {
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeam,
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer
  } = useTeams(id);
  
  const { data: team, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
    // Use a very short staleTime to always get fresh data
    staleTime: 0,
    refetchInterval: 30000, // Refetch every 30 seconds in case lineup was updated elsewhere
  });

  // Force refetch when component mounts
  useEffect(() => {
    if (id) {
      console.log("TeamLineup - Component mounted, force refetching team data");
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.refetchQueries({ queryKey: ['team', id] });
    }
  }, [id, queryClient]);

  const handleSaveLineup = async (lines: Lines) => {
    if (!id) {
      toast.error("No team ID available");
      return;
    }
    
    try {
      setSaving(true);
      console.log("TeamLineup - Saving lineup for team:", id);
      console.log("TeamLineup - Lineup data to save:", JSON.stringify(lines, null, 2));
      
      const success = await updateTeamLineup(id, lines);
      if (success) {
        console.log("TeamLineup - Lineup saved successfully");
        toast.success("Lineup saved successfully");
        
        // Important: Invalidate the team query to ensure fresh data is loaded
        await queryClient.invalidateQueries({ queryKey: ['team', id] });
        
        // Manually trigger a refetch to get the latest team data
        await refetch();
      } else {
        console.error("TeamLineup - Error saving lineup");
        toast.error("Failed to save lineup");
      }
    } catch (error) {
      console.error("TeamLineup - Error saving lineup:", error);
      toast.error("Failed to save lineup");
    } finally {
      setSaving(false);
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
          <div className="flex gap-2">
            <Button 
              variant={editorMode === 'standard' ? 'default' : 'outline'} 
              onClick={() => setEditorMode('standard')}
            >
              Standard Editor
            </Button>
            <Button 
              variant={editorMode === 'drag-drop' ? 'default' : 'outline'} 
              onClick={() => setEditorMode('drag-drop')}
            >
              Drag & Drop Editor
            </Button>
          </div>
        </div>
        
        {editorMode === 'drag-drop' ? (
          <RosterDragDrop 
            team={team} 
            onSave={handleSaveLineup}
            isSaving={saving}
          />
        ) : (
          <TeamLineupEditor 
            team={team} 
            onSaveLineup={handleSaveLineup}
            isSaving={saving}
          />
        )}

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
