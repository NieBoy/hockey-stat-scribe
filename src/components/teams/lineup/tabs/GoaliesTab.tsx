
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lines, Position } from "@/types";

interface GoaliesTabProps {
  lines: Lines;
  handlePositionSelect: (lineIndex: number, position: Position) => void;
}

export function GoaliesTab({ lines, handlePositionSelect }: GoaliesTabProps) {
  const goalie1 = lines.goalies[0] || null;
  const goalie2 = lines.goalies[1] || null;
  
  return (
    <div className="space-y-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Goalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium mb-1">Starting Goalie</p>
              <Button 
                variant="outline" 
                className="w-full justify-start mb-2"
                onClick={() => handlePositionSelect(0, 'G')}
              >
                {goalie1?.name || 'Select Goalie'}
              </Button>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Backup Goalie</p>
              <Button 
                variant="outline" 
                className="w-full justify-start mb-2"
                onClick={() => handlePositionSelect(1, 'G')}
              >
                {goalie2?.name || 'Select Goalie'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
