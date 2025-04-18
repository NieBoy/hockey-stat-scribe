
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lines, Position } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";

interface DefenseTabProps {
  lines: Lines;
  handlePositionSelect: (lineIndex: number, position: Position) => void;
  deleteDefenseLine: (lineIndex: number) => void;
  addDefenseLine: () => void;
}

export function DefenseTab({
  lines,
  handlePositionSelect,
  deleteDefenseLine,
  addDefenseLine,
}: DefenseTabProps) {
  return (
    <div className="space-y-4">
      {lines.defense.map((pair, index) => (
        <Card key={`defense-pair-${index}`} className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Defense Pair {pair.lineNumber}</CardTitle>
              {lines.defense.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500"
                  onClick={() => deleteDefenseLine(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Left Defense</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(index, 'LD')}
                >
                  {pair.leftDefense?.name || 'Select LD'}
                </Button>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Right Defense</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(index, 'RD')}
                >
                  {pair.rightDefense?.name || 'Select RD'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        onClick={addDefenseLine}
        className="w-full flex items-center gap-2 justify-center"
      >
        <PlusCircle className="h-4 w-4" />
        Add Defense Pair
      </Button>
    </div>
  );
}
