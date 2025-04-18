
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lines, Team, Position } from "@/types";
import { Loader2 } from "lucide-react";
import { NonDraggableLineupView } from "./NonDraggableLineupView";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import { ForwardsTab } from "./tabs/ForwardsTab";
import { DefenseTab } from "./tabs/DefenseTab";
import { GoaliesTab } from "./tabs/GoaliesTab";
import { PlayerSelectionModal } from "./PlayerSelectionModal";

interface SimpleLineupEditorProps {
  team: Team;
}

export function SimpleLineupEditor({ team }: SimpleLineupEditorProps) {
  const {
    lines,
    setLines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    isInitialLoadComplete,
    isLoading,
    error
  } = useLineupEditor(team);

  const [currentTab, setCurrentTab] = useState<'forwards' | 'defense' | 'goalies'>('forwards');
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const deleteForwardLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.forwards = newLines.forwards.filter((_, index) => index !== lineIndex);
    newLines.forwards = newLines.forwards.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    setLines(newLines);
  };

  const deleteDefenseLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.defense = newLines.defense.filter((_, index) => index !== lineIndex);
    newLines.defense = newLines.defense.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    setLines(newLines);
  };

  const handlePositionSelect = (lineIndex: number, position: Position) => {
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
  };

  // Get current player based on selected position
  const getCurrentPlayer = () => {
    if (!selectedPosition) return null;
    
    if (currentTab === 'forwards') {
      const line = lines.forwards[selectedLineIndex];
      if (selectedPosition === 'LW') return line.leftWing;
      if (selectedPosition === 'C') return line.center;
      if (selectedPosition === 'RW') return line.rightWing;
    }
    else if (currentTab === 'defense') {
      const line = lines.defense[selectedLineIndex];
      if (selectedPosition === 'LD') return line.leftDefense;
      if (selectedPosition === 'RD') return line.rightDefense;
    }
    else if (currentTab === 'goalies' && selectedPosition === 'G') {
      return lines.goalies[selectedLineIndex] || null;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading lineup...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Lineup Editor</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab navigation */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${currentTab === 'forwards' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('forwards')}
            >
              Forwards
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'defense' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('defense')}
            >
              Defense
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'goalies' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('goalies')}
            >
              Goalies
            </button>
          </div>

          {/* Content based on selected tab */}
          <div className="mt-4">
            {currentTab === 'forwards' && (
              <ForwardsTab
                lines={lines}
                handlePositionSelect={handlePositionSelect}
                deleteForwardLine={deleteForwardLine}
                addForwardLine={addForwardLine}
              />
            )}
            {currentTab === 'defense' && (
              <DefenseTab
                lines={lines}
                handlePositionSelect={handlePositionSelect}
                deleteDefenseLine={deleteDefenseLine}
                addDefenseLine={addDefenseLine}
              />
            )}
            {currentTab === 'goalies' && (
              <GoaliesTab
                lines={lines}
                handlePositionSelect={handlePositionSelect}
              />
            )}
            
            {/* Player selection modal */}
            {selectedPosition && (
              <PlayerSelectionModal
                currentTab={currentTab}
                selectedLineIndex={selectedLineIndex}
                selectedPosition={selectedPosition}
                currentPlayer={getCurrentPlayer()}
                availablePlayers={availablePlayers}
                onPlayerSelect={(playerId) => {
                  handlePlayerSelect(currentTab, selectedLineIndex, selectedPosition, playerId);
                  setSelectedPosition(null);
                }}
                onCancel={() => setSelectedPosition(null)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview of the current lineup */}
      <Card>
        <CardHeader>
          <CardTitle>Current Lineup</CardTitle>
        </CardHeader>
        <CardContent>
          <NonDraggableLineupView lines={lines} />
        </CardContent>
      </Card>
    </div>
  );
}
