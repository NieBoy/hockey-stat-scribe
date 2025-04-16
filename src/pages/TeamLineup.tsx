
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TeamLineupEditor from "@/components/teams/TeamLineupEditor";
import { mockTeams } from "@/lib/mock-data";
import { Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TeamLineup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const team = mockTeams.find(team => team.id === id);
  
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

  const handleSaveLineup = (lines: Lines) => {
    // In a real app, we would save this to the database
    console.log("Saved lines:", lines);
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
        
        <TeamLineupEditor team={team} onSaveLineup={handleSaveLineup} />
      </div>
    </MainLayout>
  );
}
