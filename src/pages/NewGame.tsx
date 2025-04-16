
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { mockTeams } from "@/lib/mock-data";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NewGameForm from "@/components/games/NewGameForm";
import { GameFormState } from "@/types";

export default function NewGame() {
  const navigate = useNavigate();

  const handleCreateGame = (data: GameFormState) => {
    console.log("Creating new game with data:", data);
    // Here we would typically submit this data to a backend
    // For now we'll just redirect to the games list
    navigate("/games");
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
        <NewGameForm onSubmit={handleCreateGame} teams={mockTeams} />
      </div>
    </MainLayout>
  );
}
