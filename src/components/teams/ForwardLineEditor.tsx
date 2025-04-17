
import React from "react";
import { ForwardLine, User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ForwardLineEditorProps {
  line: ForwardLine;
  index: number;
  availablePlayers: User[];
  onPlayerSelect: (lineType: 'forwards', lineIndex: number, position: Position, playerId: string) => void;
}

const ForwardLineEditor = ({ line, index, availablePlayers, onPlayerSelect }: ForwardLineEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line {line.lineNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-sm font-medium mb-1">Left Wing</p>
            <Select 
              value={line.leftWing?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'LW', value)}
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
                {line.leftWing && (
                  <SelectItem value={line.leftWing.id}>
                    {line.leftWing.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Center</p>
            <Select 
              value={line.center?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'C', value)}
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
                {line.center && (
                  <SelectItem value={line.center.id}>
                    {line.center.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Right Wing</p>
            <Select 
              value={line.rightWing?.id || 'none'} 
              onValueChange={(value) => onPlayerSelect('forwards', index, 'RW', value)}
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
                {line.rightWing && (
                  <SelectItem value={line.rightWing.id}>
                    {line.rightWing.name}
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

export default ForwardLineEditor;
