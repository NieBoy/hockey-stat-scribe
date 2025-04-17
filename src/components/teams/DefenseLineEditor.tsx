
import React from "react";
import { DefenseLine, User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DefenseLineEditorProps {
  line: DefenseLine;
  index: number;
  availablePlayers: User[];
  onPlayerSelect: (lineType: 'defense', lineIndex: number, position: Position, playerId: string) => void;
}

const DefenseLineEditor = ({ line, index, availablePlayers, onPlayerSelect }: DefenseLineEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pair {line.lineNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Left Defense</p>
              {line.leftDefense && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => onPlayerSelect('defense', index, 'LD', 'none')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select 
              value={line.leftDefense?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('defense', index, 'LD', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availablePlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
                {line.leftDefense && (
                  <SelectItem value={line.leftDefense.id}>
                    {line.leftDefense.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Right Defense</p>
              {line.rightDefense && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => onPlayerSelect('defense', index, 'RD', 'none')}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select 
              value={line.rightDefense?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('defense', index, 'RD', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availablePlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
                {line.rightDefense && (
                  <SelectItem value={line.rightDefense.id}>
                    {line.rightDefense.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefenseLineEditor;
