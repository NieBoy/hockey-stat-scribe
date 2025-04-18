
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          Select Player for {selectedPosition}
          {currentTab !== 'goalies' && ` - Line ${selectedLineIndex + 1}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select 
          value={currentPlayer?.id || "none"} 
          onValueChange={onPlayerSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {currentPlayer && (
              <SelectItem key={currentPlayer.id} value={currentPlayer.id}>
                {currentPlayer.name} (Current)
              </SelectItem>
            )}
            {availablePlayers.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
