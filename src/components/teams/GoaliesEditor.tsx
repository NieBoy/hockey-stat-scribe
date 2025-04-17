
import React from "react";
import { User, Position } from "@/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoaliesEditorProps {
  goalies: User[];
  availablePlayers: User[];
  onPlayerSelect: (lineType: 'goalies', lineIndex: number, position: Position, playerId: string) => void;
}

const GoaliesEditor = ({ goalies, availablePlayers, onPlayerSelect }: GoaliesEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goalies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {goalies.map((goalie, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>{goalie.name}</div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPlayerSelect('goalies', 0, 'G', goalie.id)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          {availablePlayers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Add Goalie</p>
              <Select 
                onValueChange={(value) => onPlayerSelect('goalies', 0, 'G', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoaliesEditor;
