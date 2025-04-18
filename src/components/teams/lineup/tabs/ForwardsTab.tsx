
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lines, User, Position } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";

interface ForwardsTabProps {
  lines: Lines;
  handlePositionSelect: (lineIndex: number, position: Position) => void;
  deleteForwardLine: (lineIndex: number) => void;
  addForwardLine: () => void;
}

export function ForwardsTab({
  lines,
  handlePositionSelect,
  deleteForwardLine,
  addForwardLine,
}: ForwardsTabProps) {
  return (
    <div className="space-y-4">
      {lines.forwards.map((line, index) => (
        <Card key={`forward-line-${index}`} className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Forward Line {line.lineNumber}</CardTitle>
              {lines.forwards.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500"
                  onClick={() => deleteForwardLine(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Left Wing</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(index, 'LW')}
                >
                  {line.leftWing?.name || 'Select LW'}
                </Button>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Center</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(index, 'C')}
                >
                  {line.center?.name || 'Select C'}
                </Button>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Right Wing</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(index, 'RW')}
                >
                  {line.rightWing?.name || 'Select RW'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        onClick={addForwardLine}
        className="w-full flex items-center gap-2 justify-center"
      >
        <PlusCircle className="h-4 w-4" />
        Add Forward Line
      </Button>
    </div>
  );
}
