
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lines, Team, Position } from "@/types";
import { Loader2, SaveIcon, RefreshCw } from "lucide-react";
import { NonDraggableLineupView } from "./NonDraggableLineupView";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import { ForwardsTab } from "./tabs/ForwardsTab";
import { DefenseTab } from "./tabs/DefenseTab";
import { GoaliesTab } from "./tabs/GoaliesTab";
import { PlayerSelectionModal } from "./PlayerSelectionModal";
import { toast } from "sonner";

interface SimpleLineupEditorProps {
  team: Team;
  onSaveLineup?: (lines: Lines) => Promise<boolean>;
}

export function SimpleLineupEditor({ team, onSaveLineup }: SimpleLineupEditorProps) {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    deleteForwardLine,
    deleteDefenseLine,
    isInitialLoadComplete,
    isLoading,
    error,
    refreshLineupData
  } = useLineupEditor(team);

  const [currentTab, setCurrentTab] = useState<'forwards' | 'defense' | 'goalies'>('forwards');
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use a ref to track if initial save has occurred
  const initialSaveAttemptedRef = useRef<boolean>(false);
  
  // Track if lines have changed since last save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const previousLinesRef = useRef<string>(JSON.stringify(lines));

  // Force refresh from database when component mounts
  useEffect(() => {
    console.log("SimpleLineupEditor - Initial component mount, forcing refresh");
    setRefreshKey(Date.now());
  }, []);

  // Detect changes in the lineup
  useEffect(() => {
    const currentLinesString = JSON.stringify(lines);
    if (previousLinesRef.current !== currentLinesString) {
      setHasUnsavedChanges(true);
      previousLinesRef.current = currentLinesString;
    }
  }, [lines]);

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

  // Function to manually refresh lineup data from database
  const handleRefresh = useCallback(async () => {
    console.log("SimpleLineupEditor - Manual refresh requested");
    toast.info("Refreshing lineup data...");
    try {
      await refreshLineupData();
      setRefreshKey(Date.now());
      toast.success("Lineup data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing lineup data:", error);
      toast.error("Failed to refresh lineup data");
    }
  }, [refreshLineupData]);

  // Save the lineup when requested
  const handleSave = async () => {
    if (onSaveLineup) {
      try {
        setIsSaving(true);
        initialSaveAttemptedRef.current = true;
        
        console.log("SimpleLineupEditor - Saving lineup data:", JSON.stringify(lines, null, 2));
        
        const success = await onSaveLineup(lines);
        
        if (success) {
          toast.success("Lineup saved successfully");
          setHasUnsavedChanges(false);
          
          // Force a refresh from the database to make sure we have the latest data
          console.log("SimpleLineupEditor - Save successful, refreshing data");
          setRefreshKey(Date.now());
        } else {
          toast.error("Failed to save lineup");
        }
        
        return success;
      } catch (error) {
        console.error("Error saving lineup:", error);
        toast.error("Error saving lineup", {
          description: error instanceof Error ? error.message : "Unknown error"
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return false;
  };

  // Auto-save handler
  useEffect(() => {
    // Only attempt to auto-save if:
    // 1. We're not already saving
    // 2. There are unsaved changes
    // 3. We're not on initial load
    if (!isSaving && hasUnsavedChanges && initialSaveAttemptedRef.current) {
      const timeoutId = setTimeout(() => {
        console.log("SimpleLineupEditor - Auto-saving lineup changes");
        handleSave();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, isSaving]);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Lineup Editor</CardTitle>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {onSaveLineup && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                variant={hasUnsavedChanges ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                {hasUnsavedChanges ? "Save Changes" : "Save Lineup"}
              </Button>
            )}
          </div>
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
                  setHasUnsavedChanges(true);
                }}
                onCancel={() => setSelectedPosition(null)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview of the current lineup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Lineup</CardTitle>
          {hasUnsavedChanges && (
            <div className="text-sm text-amber-500">
              * Unsaved changes
            </div>
          )}
        </CardHeader>
        <CardContent>
          <NonDraggableLineupView lines={lines} />
          
          {hasUnsavedChanges && onSaveLineup && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
