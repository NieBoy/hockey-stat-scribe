
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Team, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup?: (selectedPlayers: User[]) => Promise<void>;
  isSaving?: boolean;
}

export default function TeamLineupEditor({ team, onSaveLineup, isSaving = false }: TeamLineupEditorProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);

  // Sort players by number when possible
  const sortedPlayers = [...team.players].sort((a, b) => {
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    return numA - numB;
  });

  const handlePlayerToggle = (player: User) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleSave = async () => {
    if (!onSaveLineup) return;
    
    try {
      await onSaveLineup(selectedPlayers);
      toast.success("Player selection saved successfully");
    } catch (error) {
      console.error("Error saving player selection:", error);
      toast.error("Failed to save player selection");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Roster</h1>
        {onSaveLineup && (
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Selection'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Players by Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {sortedPlayers.map(player => (
              <Card 
                key={player.id} 
                className={`cursor-pointer ${selectedPlayers.some(p => p.id === player.id) ? 'border-primary' : ''}`}
                onClick={() => handlePlayerToggle(player)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    {player.number && (
                      <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                        #{player.number}
                      </span>
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
