
import React from "react";
import { DefenseLine, User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium mb-1">Left Defense</p>
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
            <p className="text-sm font-medium mb-1">Right Defense</p>
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
