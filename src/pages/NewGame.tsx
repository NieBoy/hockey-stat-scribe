
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NewGameForm from "@/components/games/NewGameForm";
import { GameFormState } from "@/types";
import { createGame } from "@/services/games";
import { getTeams } from "@/services/teams";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function NewGame() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams
  });

  const handleCreateGame = async (data: GameFormState) => {
    try {
      setLoading(true);
      await createGame(data);
      toast.success("Game created successfully!");
      navigate("/games");
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to="/games">
            <ChevronLeft className="h-4 w-4" /> Back to Games
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Schedule New Game</h1>
        <p className="text-muted-foreground">
          Create a new game and assign stat trackers.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Error loading teams</p>
            <Button onClick={() => navigate("/teams/new")}>Create Team First</Button>
          </div>
        ) : (
          <NewGameForm 
            onSubmit={handleCreateGame} 
            teams={teams || []} 
            isSubmitting={loading}
          />
        )}
      </div>
    </MainLayout>
  );
}
