
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Position } from "@/types";

interface PlayerSelectionModalProps {
  currentTab: 'forwards' | 'defense' | 'goalies';
  selectedLineIndex: number;
  selectedPosition: Position;
  currentPlayer: User | null;
  availablePlayers: User[];
  onPlayerSelect: (playerId: string) => void;
  onCancel: () => void;
}

export function PlayerSelectionModal({
  currentTab,
  selectedLineIndex,
  selectedPosition,
  currentPlayer,
  availablePlayers,
  onPlayerSelect,
  onCancel,
}: PlayerSelectionModalProps) {
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    // Sort by number if available, then by name
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          Select Player for {selectedPosition}
          {currentTab !== 'goalies' && ` - Line ${selectedLineIndex + 1}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => onPlayerSelect("none")}
            >
              None (Clear Position)
            </Button>
            
            {currentPlayer && (
              <Button
                key={currentPlayer.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onPlayerSelect(currentPlayer.id)}
              >
                {currentPlayer.name} {currentPlayer.number && `#${currentPlayer.number}`} (Current)
              </Button>
            )}
            
            {sortedPlayers.map(player => (
              <Button
                key={player.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onPlayerSelect(player.id)}
              >
                {player.name} {player.number && `#${player.number}`}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}

