
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lines, Team, Position } from "@/types";
import { NonDraggableLineupView } from "./NonDraggableLineupView";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import { PlayerSelectionModal } from "./PlayerSelectionModal";
import { useLineupSave } from "@/hooks/lineup/useLineupSave";
import { LineupHeader } from "./components/LineupHeader";
import { LineupTabs } from "./components/LineupTabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SimpleLineupEditorProps {
  team: Team;
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
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
  
  // Normalize onSaveLineup to always return a Promise<boolean>
  const normalizedOnSaveLineup = async (lines: Lines): Promise<boolean> => {
    if (!onSaveLineup) return false;
    try {
      console.log("Manual save initiated from SimpleLineupEditor");
      const result = await onSaveLineup(lines);
      // Treat both undefined and true as success
      return result === undefined || result === true;
    } catch (error) {
      console.error("Error in normalized save function:", error);
      return false;
    }
  };

  const { 
    isSaving, 
    hasUnsavedChanges, 
    handleSave 
  } = useLineupSave({
    onSaveLineup: normalizedOnSaveLineup,
    lines
  });

  // Add this effect to log lineup changes for debugging
  useEffect(() => {
    console.log("Lineup updated, changes will only be saved when you click Save button");
  }, [lines]);

  const handlePositionSelect = (lineIndex: number, position: Position) => {
    console.log(`Selected position: Line ${lineIndex}, Position ${position}`);
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
  };

  const handlePlayerSelectWithLogging = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    console.log(`Selecting player: ${playerId} for ${lineType}, line ${lineIndex}, position ${position}`);
    
    try {
      handlePlayerSelect(lineType, lineIndex, position, playerId);
      console.log("Player selection successful");
    } catch (error) {
      console.error("Error selecting player:", error);
      toast.error("Failed to select player");
    }
    
    setSelectedPosition(null);
  };

  const getCurrentPlayer = () => {
    if (!selectedPosition) return null;
    
    if (currentTab === 'forwards') {
      const line = lines.forwards[selectedLineIndex];
      if (!line) return null; // Guard clause if line is undefined
      
      if (selectedPosition === 'LW') return line.leftWing;
      if (selectedPosition === 'C') return line.center;
      if (selectedPosition === 'RW') return line.rightWing;
    }
    else if (currentTab === 'defense') {
      const line = lines.defense[selectedLineIndex];
      if (!line) return null; // Guard clause if line is undefined
      
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
                handlePlayerSelectWithLogging(currentTab, selectedLineIndex, selectedPosition, playerId);
              }}
              onCancel={() => setSelectedPosition(null)}
            >
              <span className="sr-only">Select Player</span>
            </PlayerSelectionModal>
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
