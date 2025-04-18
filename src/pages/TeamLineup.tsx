import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TeamLineupEditor from "@/components/teams/TeamLineupEditor";
import { Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTeamById, updateTeamLineup } from "@/services/teams";
import { useTeams } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import RosterDragDrop from "@/components/teams/RosterDragDrop";

export default function TeamLineup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    enabled: !!id
  });

  const handleSaveLineup = async (lines: Lines) => {
    if (!id) return;
    
    try {
      setSaving(true);
      await updateTeamLineup(id, lines);
      refetch();
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Failed to save lineup");
    } finally {
      setSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
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

  if (!team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist.</p>
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
          />
        ) : (
          <TeamLineupEditor 
            team={team} 
            onSaveLineup={handleSaveLineup}
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
