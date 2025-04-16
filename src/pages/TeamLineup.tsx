
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TeamLineupEditor from "@/components/teams/TeamLineupEditor";
import { Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTeamById, updateTeamLineup } from "@/services/teams";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function TeamLineup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id
  });
  
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
          <p>The team you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  const handleSaveLineup = async (lines: Lines) => {
    if (!id) return;
    
    try {
      setSaving(true);
      await updateTeamLineup(id, lines);
      toast.success("Team lineup saved successfully!");
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Failed to save lineup");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={() => navigate(`/teams/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Team
        </Button>
        
        <TeamLineupEditor team={team} onSaveLineup={handleSaveLineup} isSaving={saving} />
      </div>
    </MainLayout>
  );
}
