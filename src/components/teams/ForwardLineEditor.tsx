
import React, { useEffect } from "react";
import { ForwardLine, User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";

interface ForwardLineEditorProps {
  line: ForwardLine;
  index: number;
  availablePlayers: User[];
  onPlayerSelect: (lineType: 'forwards', lineIndex: number, position: Position, playerId: string) => void;
}

const ForwardLineEditor = ({ line, index, availablePlayers, onPlayerSelect }: ForwardLineEditorProps) => {
  // Log for debugging when the component renders
  useEffect(() => {
    console.log(`ForwardLineEditor ${index} rendering with ${availablePlayers.length} available players`);
    console.log(`Line ${index} data:`, line);
  }, [index, line, availablePlayers.length]);

  // Get all players eligible for each position
  const getSelectablePlayers = (currentPlayer: User | null) => {
    const selectablePlayers = currentPlayer 
      ? [...availablePlayers, currentPlayer]
      : availablePlayers;
    
    return [...selectablePlayers].sort((a, b) => a.name.localeCompare(b.name));
  };

  const leftWingPlayers = getSelectablePlayers(line.leftWing);
  const centerPlayers = getSelectablePlayers(line.center);
  const rightWingPlayers = getSelectablePlayers(line.rightWing);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line {line.lineNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Left Wing</p>
              {line.leftWing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => onPlayerSelect('forwards', index, 'LW', 'none')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select 
              value={line.leftWing?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'LW', value)}
              onOpenChange={(open) => {
                if (open) console.log("LW select opened with options:", leftWingPlayers.map(p => p.name));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {leftWingPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.id === line.leftWing?.id ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Center</p>
              {line.center && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => onPlayerSelect('forwards', index, 'C', 'none')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select 
              value={line.center?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'C', value)}
              onOpenChange={(open) => {
                if (open) console.log("C select opened with options:", centerPlayers.map(p => p.name));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {centerPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.id === line.center?.id ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Right Wing</p>
              {line.rightWing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => onPlayerSelect('forwards', index, 'RW', 'none')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select 
              value={line.rightWing?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'RW', value)}
              onOpenChange={(open) => {
                if (open) console.log("RW select opened with options:", rightWingPlayers.map(p => p.name));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {rightWingPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.id === line.rightWing?.id ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForwardLineEditor;
