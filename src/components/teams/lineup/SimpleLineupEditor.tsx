import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lines, Team, Position } from "@/types";
import { NonDraggableLineupView } from "./NonDraggableLineupView";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import { PlayerSelectionModal } from "./PlayerSelectionModal";
import { useLineupSave } from "@/hooks/lineup/useLineupSave";
import { LineupHeader } from "./components/LineupHeader";
import { LineupTabs } from "./components/LineupTabs";

interface SimpleLineupEditorProps {
  team: Team;
  onSaveLineup?: (lines: Lines) => Promise<boolean>;
}

export function SimpleLineupEditor({ team, onSaveLineup }: SimpleLineupEditorProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    deleteForwardLine,
    deleteDefenseLine,
    refreshLineupData
  } = useLineupEditor(team);

  const [currentTab, setCurrentTab] = useState<'forwards' | 'defense' | 'goalies'>('forwards');
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
  const { isSaving, hasUnsavedChanges, handleSave } = useLineupSave({
    onSaveLineup,
    lines
  });

  const handlePositionSelect = (lineIndex: number, position: Position) => {
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <LineupHeader
          onSave={handleSave}
          onRefresh={refreshLineupData}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <CardContent>
          <LineupTabs
            lines={lines}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            handlePositionSelect={handlePositionSelect}
            deleteForwardLine={deleteForwardLine}
            deleteDefenseLine={deleteDefenseLine}
            addForwardLine={addForwardLine}
            addDefenseLine={addDefenseLine}
          />
          
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
        </CardContent>
      </Card>

      {/* Preview of the current lineup */}
      <Card>
        <CardContent>
          <NonDraggableLineupView lines={lines} />
        </CardContent>
      </Card>
    </div>
  );
}
