
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Position } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PlayerSelectionModalProps {
  currentTab: 'forwards' | 'defense' | 'goalies';
  selectedLineIndex: number;
  selectedPosition: Position;
  currentPlayer: User | null;
  availablePlayers: User[];
  onPlayerSelect: (playerId: string) => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export function PlayerSelectionModal({
  currentTab,
  selectedLineIndex,
  selectedPosition,
  currentPlayer,
  availablePlayers,
  onPlayerSelect,
  onCancel,
  children
}: PlayerSelectionModalProps) {
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    // Sort by number if available, then by name
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" side="right">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Select Player for {selectedPosition}
              {currentTab !== 'goalies' && ` - Line ${selectedLineIndex + 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-8" 
                  onClick={() => onPlayerSelect("none")}
                >
                  None (Clear Position)
                </Button>
                
                {currentPlayer && (
                  <Button
                    key={currentPlayer.id}
                    variant="ghost"
                    className="w-full justify-start h-8"
                    onClick={() => onPlayerSelect(currentPlayer.id)}
                  >
                    {currentPlayer.name} {currentPlayer.number && `#${currentPlayer.number}`} (Current)
                  </Button>
                )}
                
                {sortedPlayers.map(player => (
                  <Button
                    key={player.id}
                    variant="ghost"
                    className="w-full justify-start h-8"
                    onClick={() => onPlayerSelect(player.id)}
                  >
                    {player.name} {player.number && `#${player.number}`}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
