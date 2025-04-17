
import React from "react";
import { ForwardLine, User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
